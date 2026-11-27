import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { createPage, listCategories, listPages, searchPages, type CategoryOption, type PageSummary } from "../../api";
import SearchFilterBar from "../SearchFilterBar/SearchFilterBar";
import homeIcon from "../../assets/casa.svg";
import pageIcon from "../../assets/pagina.svg";
import "./Sidebar.css";

interface Navigation {
  owned: PageSummary[];
  favorites: PageSummary[];
  shared: PageSummary[];
  categories: CategoryOption[];
}

function PageLinks({ title, pages }: { title: string; pages: PageSummary[] }) {
  return <section>
    <h3>{title}</h3>
    <ul className="sidebar-list">
      {pages.map((page) => <li key={page.id}>
        <Link to={`/pages/${page.id}`} className="sidebar-link"><img src={pageIcon} alt="" /> {page.title}</Link>
      </li>)}
    </ul>
  </section>;
}

export default function Sidebar({ refreshKey = "", parentId }: { refreshKey?: string; parentId?: string }) {
  const [navigation, setNavigation] = useState<Navigation>();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<{ query: string; pages: PageSummary[] }>();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void Promise.all([listPages("owned", {}, signal), listPages("favorites", {}, signal),
      listPages("shared", {}, signal), listCategories(signal)])
      .then(([owned, favorites, shared, categories]) => {
        if (!signal.aborted) setNavigation({ owned, favorites, shared, categories });
      }, () => { if (!signal.aborted) setError("Não foi possível carregar a navegação."); });
    return () => controller.abort();
  }, [refreshKey]);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const { signal } = controller;
    const timeout = window.setTimeout(() => {
      void searchPages(query, signal).then((pages) => {
        if (!signal.aborted) setSearch({ query, pages });
      }, () => { if (!signal.aborted) setError("Não foi possível pesquisar as páginas."); });
    }, 300);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [query, refreshKey]);

  async function addSubpage() {
    if (!parentId || creating) return;
    setCreating(true);
    try {
      const { id } = await createPage({ title: "Nova subpágina", categoryId: null, parentId });
      navigate(`/pages/${id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar a subpágina.");
    } finally {
      setCreating(false);
    }
  }

  return <aside className="sidebar">
    <section className="sidebar-pages">
      <div className="sidebar-pages-header">
        <Link className="sidebar-link" to="/"><img src={homeIcon} alt="" /> Folio</Link>
      </div>
      <div className="sidebar-search">
        <SearchFilterBar showFilter={false} onSearchChange={(value) => { setQuery(value.trim()); setError(""); }} />
      </div>
      {error && <p role="alert">{error}</p>}
      <nav className="sidebar-navigation" aria-label="Páginas">
        {query
          ? <PageLinks title="Resultados da busca" pages={search?.query === query ? search.pages : []} />
          : navigation && <>
            <PageLinks title="Páginas recentes" pages={navigation.owned.slice(0, 5)} />
            <PageLinks title="Favoritos" pages={navigation.favorites} />
            <PageLinks title="Compartilhadas comigo" pages={navigation.shared} />
            <h3>Categorias</h3>
            <ul className="sidebar-list">
              {navigation.categories.map((item) => <li key={item.id}><Link to={`/?category=${item.id}`}>{item.name}</Link></li>)}
              <li><Link to="/?category=uncategorized">Sem categoria</Link></li>
            </ul>
            <PageLinks title="Minhas páginas" pages={navigation.owned} />
          </>}
      </nav>
      <div className="sidebar-create-button">
        {parentId
          ? <button className="new-page" type="button" disabled={creating} onClick={addSubpage}>Criar subpágina</button>
          : <button className="new-page" type="button" onClick={() => navigate("/")}>Gerenciar páginas</button>}
      </div>
    </section>
  </aside>;
}
