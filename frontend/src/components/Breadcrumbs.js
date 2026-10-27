import Link from "next/link";

export default function Breadcrumbs({ currentPage }) {
  return (
    <div className="breadcrumb-bar">
      <nav className="container breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{currentPage}</span>
      </nav>
    </div>
  );
}
