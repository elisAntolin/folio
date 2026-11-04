import "./EditorPage.css";

import Header from "../../components/Header/Header";
import Collaborators from "../../components/Collaborators/Collaborators";
import PageDocument from "../../components/PageDocument/PageDocument";
import Sidebar from "../../components/Sidebar/Sidebar";
import ShareButton from "../../components/ShareButton/ShareButton";

function EditorPage() {
  return (
    <div className="editor-page">
      <Header />
      <div className="editor-body">
        <Sidebar />
        <div className="editor-content">
          <main className="editor-main">
            <div className="colaboration-bar">
              <Collaborators></Collaborators>
              <ShareButton></ShareButton>
            </div>
            <PageDocument />
          </main>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
