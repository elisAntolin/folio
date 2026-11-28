import { useState } from "react";
import "./AddPageButton.css";

import plusIcon from "../../assets/mais.svg";
import CreatePageModal from "../modals/CreatePageModal/CreatePageModal";

interface AddPageButtonProps {
  onCreate: (title: string, category: string) => void;
  label?: string;
}

function AddPageButton({
  onCreate,
  label = "Nova Página",
}: AddPageButtonProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <button className="new-page" onClick={() => setIsCreateOpen(true)}>
        <img src={plusIcon} alt="" />
        <span>{label}</span>
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
