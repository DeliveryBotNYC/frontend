const ApiStats = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="w-full mb-4">
      {/* label */}
      <p className="text-xs text-themeDarkGray">{label}</p>

      {/* Value */}
      <p className="text-lg font-semibold text-black mt-1">{value}</p>
    </div>
  );
};

export default ApiStats;
