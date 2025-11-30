import PdfFilter from "../components/pdfFilter";
import PdfPaginator from "../components/pdfPaginator";
import PdfView from "../components/pdfView";

export default function PdfMainView() {
  return (
    <div>
      <h1>Gestion de PDFs</h1>
      <PdfFilter />
      <PdfView />
      <PdfPaginator />
    </div>
  );
}
