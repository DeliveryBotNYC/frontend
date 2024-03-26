const BlackOverlay = ({ closeFunc }: { closeFunc?: () => void }) => {
  return (
    <div
      onClick={closeFunc}
      className="w-full h-full fixed inset-0 bg-black bg-opacity-30 z-[9999]"
    ></div>
  );
};

export default BlackOverlay;
