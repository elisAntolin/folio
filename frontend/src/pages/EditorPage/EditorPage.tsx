import "./EditorPage.css";

import Header from "../../components/Header/Header";
import PageDocument from "../../components/PageDocument/PageDocument";
import EditorToolbar from "../../components/EditorToolbar/EditorToolbar";
import Sidebar from "../../components/Sidebar/Sidebar";

function EditorPage() {
  return (
    <div className="editor-page">
      <Header />
      <div className="editor-body">
        <Sidebar />
        <div className="editor-content">
          <EditorToolbar />
          <main className="editor-main">
            <PageDocument />
          </main>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
