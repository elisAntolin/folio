import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import Header from "../../components/Header/Header";
import SearchFilterBar from "../../components/SearchFilterBar/SearchFilterBar";
import PagesToolbar from "../../components/PagesToolbar/PagesToolbar";
import PageListCard from "../../components/PageListCard/PageListCard";
import PageListItem from "../../components/PageListItem/PageListItem";
import { changeFavorite, createPage, deletePage, getEditorSessionKey, listCategories, listPages, renamePage,
  searchPages, updatePage, type CategoryOption, type PageFilters, type PageSummary } from "../../api";
import { PageCategoriesContext } from "../../pageCategories";

interface Results {
  key: string;
  pages?: PageSummary[];
  error?: string;
}

const pageSize = 40;

function PageBrowser() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [section, setSection] = useState<"owned" | "shared" | "favorites">("owned");
  const [position, setPosition] = useState(0);
  const [query, setQuery] = useState("");
  const [revision, setRevision] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categoryError, setCategoryError] = useState("");
  const [results, setResults] = useState<Results>();
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState("");
  const pendingFavorites = useRef(new Set<string>());
  const active = useRef(true);
  const activeCategory = section === "shared" ? "" : category;
  const resultKey = JSON.stringify([query, section, activeCategory, position, revision]);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void listCategories(signal).then((options) => {
      if (!signal.aborted) {
        setCategoryOptions(options);
        setCategoryError("");
      }
    }, (reason: unknown) => {
      if (!signal.aborted) setCategoryError(reason instanceof Error ? reason.message : "Categorias indisponíveis.");
    });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const filters: PageFilters = {
      categoryId: activeCategory && activeCategory !== "uncategorized" ? activeCategory : undefined,
      uncategorized: activeCategory === "uncategorized",
      favoritesOnly: section === "favorites",
      page: position,
    };

    function load() {
      const result = query ? searchPages(query, signal, filters) : listPages(section, filters, signal);
      void result.then((pages) => {
        if (!signal.aborted) setResults({ key: resultKey, pages });
      }, (reason: unknown) => {
        if (!signal.aborted) setResults({
          key: resultKey, error: reason instanceof Error ? reason.message : "Não foi possível carregar as páginas.",
        });
      });
    }

    if (!query) {
      load();
      return () => controller.abort();
    }

    const timeout = window.setTimeout(load, 300);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [resultKey, query, section, activeCategory, position]);

  const refresh = () => setRevision((value) => value + 1);
  const result = results?.key === resultKey ? results : undefined;
  const pages = (result?.pages ?? [])
    .map((page) => ({ ...page, favorite: optimistic[page.id] ?? page.favorite }))
    .filter((page) => section !== "favorites" || page.favorite);
  const PageList = mode === "grid" ? PageListCard : PageListItem;

  function changeSection(value: typeof section) {
    setSection(value);
    setPosition(0);
  }

  async function favorite(id: string, value: boolean) {
    if (pendingFavorites.current.has(id)) return;
    pendingFavorites.current.add(id);
    setActionError("");
    setOptimistic((current) => ({ ...current, [id]: value }));
    try {
      await changeFavorite(id, value);
      if (active.current) {
        setResults((current) => current?.pages ? {
          ...current, pages: current.pages.map((page) => page.id === id ? { ...page, favorite: value } : page),
        } : current);
        refresh();
      }
    } catch (reason) {
      if (active.current) setActionError(reason instanceof Error ? reason.message : "Não foi possível atualizar os favoritos.");
    } finally {
      pendingFavorites.current.delete(id);
      if (active.current) setOptimistic((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  }

  function renderPages(items: PageSummary[]) {
    return <PageList pages={items}
      onEdit={async (id, title, nextCategory) => {
        const page = items.find((item) => item.id === id);
        if (page?.permission === "EDITOR") await renamePage(id, title);
        else await updatePage(id, { title, categoryId: nextCategory || null });
        refresh();
      }}
      onDelete={async (id) => { await deletePage(id); refresh(); }}
      onFavoriteChange={favorite}
    />;
  }

  return <PageCategoriesContext.Provider value={categoryOptions}>
    <Header />
    <main>
      <section className="search-section">
        <SearchFilterBar showFilter={false} onSearchChange={(value) => { setQuery(value.trim()); setPosition(0); }} />
        {section !== "shared" && <label>
          Categoria <select value={category} onChange={(event) => {
            const value = event.target.value;
            setParams(value ? { category: value } : {});
            setPosition(0);
          }}>
            <option value="">Todas</option>
            <option value="uncategorized">Sem categoria</option>
            {categoryOptions.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>}
      </section>
      <section className="pages-section">
        <PagesToolbar mode={mode} changeMode={setMode} onCreate={async (title, selected) => {
          await createPage({ title, categoryId: selected || null });
          setPosition(0);
          refresh();
        }} showFavorites={section === "favorites"} onFavoritesChange={(value) => changeSection(value ? "favorites" : "owned")} />
        <nav aria-label="Lista de páginas">
          <button type="button" aria-pressed={section === "owned"} onClick={() => changeSection("owned")}>Minhas páginas</button>
          <button type="button" aria-pressed={section === "shared"} onClick={() => changeSection("shared")}>Compartilhadas comigo</button>
          <button type="button" aria-pressed={section === "favorites"} onClick={() => changeSection("favorites")}>Favoritos</button>
        </nav>
        {categoryError && <p role="alert">{categoryError}</p>}
        {actionError && <p role="alert">{actionError}</p>}
        {!result && <p role="status">{query ? "Pesquisando…" : "Carregando páginas…"}</p>}
        {result?.error && <div><p role="alert">{result.error}</p><button type="button" onClick={refresh}>Tentar novamente</button></div>}
        {result?.pages && (pages.length === 0 ? <p>Nenhuma página encontrada.</p>
          : query && section !== "favorites" ? <>
            {section === "owned" && renderPages(pages.filter((page) => page.permission === "OWNER"))}
            {pages.some((page) => page.permission !== "OWNER") && <section>
              <h2>Compartilhadas comigo</h2>
              {renderPages(pages.filter((page) => page.permission !== "OWNER"))}
            </section>}
          </> : renderPages(pages))}
        {!query && result?.pages && (position > 0 || result.pages.length === pageSize) && <nav aria-label="Paginação">
          <button type="button" disabled={position === 0} onClick={() => setPosition(position - 1)}>Anterior</button>
          <button type="button" disabled={result.pages.length < pageSize} onClick={() => setPosition(position + 1)}>Próxima</button>
        </nav>}
      </section>
    </main>
  </PageCategoriesContext.Provider>;
}

export default function HomePage() {
  return <PageBrowser key={getEditorSessionKey() ?? "anonymous"} />;
}
