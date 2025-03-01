import ContentBox from "../reusable/ContentBox";
import InvoicesSearchbox from "./CustomersSearchbox";
import InvoicesTable from "./CustomersTable";

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
