import "./EditorPage.css";
import { useParams } from "react-router";

import Header from "../../components/Header/Header";
import Collaborators from "../../components/Collaborators/Collaborators";
import PersistentPageDocument from "../../editor/PersistentPageDocument";
import Sidebar from "../../components/Sidebar/Sidebar";
import ShareButton from "../../components/ShareButton/ShareButton";

function EditorPage() {
  const { id = "" } = useParams();

  return (
    <div className="editor-page">
      <Header />
      <div className="editor-body">
        <Sidebar />
        <div className="editor-content">
          <main className="editor-main">
            <div className="colaboration-bar">
              <Collaborators></Collaborators>
              <ShareButton
                pageTitle="Página"
                publicLink={`/pages/${id}`}
                internal
                onInvite={(email, permission) =>
                  console.log("Convidar membro:", email, permission)
                }
                onLinkPermissionChange={() => undefined}
              />
            </div>
            <PersistentPageDocument pageId={id} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
