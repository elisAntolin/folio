import "./EditorPage.css";

import Header from "../../components/Header/Header";
import PageDocument from "../../components/PageDocument/PageDocument";
import EditorToolbar from "../../components/EditorToolbar/EditorToolbar";
// import Sidebar from "../../components/Sidebar/Sidebar";

function EditorPage() {
  return (
    <div>
      <Header></Header>
      <main className="editor-page">
        {/* <section>
          <Sidebar></Sidebar>
        </section> */}
        <section>
          <EditorToolbar></EditorToolbar>
        </section>
        <section>
          <PageDocument></PageDocument>
        </section>
      </main>
    </div>
  );
}

export default EditorPage;
