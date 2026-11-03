// import "./Sidebar.css";

// import mais from "../../assets/mais.svg";

// import SearchBar from "../../components/SearchFilterBar/SearchFilterBar";

// import { Link } from "react-router";

// const subpages = [
//   {
//     id: "1",
//     name: "Visão Geral",
//     icon: home,
//   },
//   {
//     id: "2",
//     name: "Subpágina 1",
//     icon: pasta,
//   },
//   {
//     id: "3",
//     name: "Subpágina 2",
//     icon: pagina,
//   },
// ];

// function Sidebar() {
//   return (
//     <aside className="sidebar">
//       <div className="sidebar-search">
//         <SearchBar />
//       </div>

//       <hr className="sidebar-divider" />

//       <section className="sidebar-pages" aria-labelledby="sidebar-title">
//         <div className="sidebar-pages-header">
//           <h2 id="sidebar-title">Back-End</h2>

//           <button className="new-page" aria-label="Nova subpágina">
//             <img src={mais} alt="" />
//           </button>
//         </div>

//         <nav className="sidebar-navigation" aria-label="Subpáginas">
//           <ul className="sidebar-list">
//             {subpages.map((page) => (
//               <li key={page.id} className="sidebar-list-item">
//                 <Link to={`/pages/${page.id}`} className="sidebar-link">
//                   <img src={page.icon} alt="" />
//                   <span>{page.name}</span>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </section>
//     </aside>
//   );
// }

// export default Sidebar;
