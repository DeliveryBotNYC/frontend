import ContentBox from "../reusable/ContentBox";
import InvoicesSearchbox from "./InvoicesSearchbox";
import InvoicesTable from "./InvoicesTable";

const InvoiceContent = () => {
  return (
    <ContentBox>
      {/* Header */}
      <InvoicesSearchbox />

      {/* Table */}
      <InvoicesTable />
    </ContentBox>
  );
};

export default InvoiceContent;
