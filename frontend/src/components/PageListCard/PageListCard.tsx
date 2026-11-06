import PageCard from "../PageCard/PageCard";

import "./PageListCard.css";

interface PageListCardProps {
  name: string;
  category: string;
  time: string;
}

function PageListCard({ name, category, time }: PageListCardProps) {
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

export default PageListCard;
