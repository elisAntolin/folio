import PageCard from "../PageCard/PageCard";

import "./PageList.css";

type CardProps = {
  name: string;
  category: string;
  time: string;
};

function PageList({ name, category, time }: CardProps) {
  return (
    <div className="page-list">
      <PageCard />
      <PageCard />
      <PageCard />
      <PageCard />
      <PageCard />
      <PageCard />
    </div>
  );
}

export default PageList;
