import { useState } from "react";
import Header from "../../components/Header/Header";
import SearchFilterBar from "../../components/SearchFilterBar/SearchFilterBar";
import PagesToolbar from "../../components/PagesToolbar/PagesToolbar";
import PageListCard from "../../components/PageListCard/PageListCard";
import PageListItem from "../../components/PageListItem/PageListItem";

function HomePage() {
  const [mode, setMode] = useState<"grid" | "list">("grid");

  return (
    <div>
      <Header></Header>
      <main>
        <section className="search-section">
          <SearchFilterBar />
        </section>

        <section className="pages-section">
          <PagesToolbar mode={mode} changeMode={setMode} />
          {mode === "grid" ? <PageListCard /> : <PageListItem />}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
