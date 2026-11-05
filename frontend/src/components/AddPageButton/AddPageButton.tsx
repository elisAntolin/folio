import { useState } from "react";
import "./AddPageButton.css";

import mais from "../../assets/mais.svg";
import CreatePageModal from "../modals/CreatePageModal/CreatePageModal";

interface AddPageButtonProps {
  onCreate: (title: string, category: string) => void;
}

function AddPageButton({ onCreate }: AddPageButtonProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <button className="new-page" onClick={() => setIsCreateOpen(true)}>
        <img src={mais} alt="" />
        <span>Nova Página</span>
      </button>

      <CreatePageModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={onCreate}
      />
    </>
  );
}

export default AddPageButton;
