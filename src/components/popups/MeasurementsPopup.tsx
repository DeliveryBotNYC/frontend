import { useState, useCallback } from "react";
import CloseIcon from "../../assets/close-gray.svg";
import { FormInput } from "../reusable/FormComponents";

const MeasurementsPopup = ({ show, onClose, items, onSave, permissions }) => {
  const [measurements, setMeasurements] = useState(() =>
    items.map((item) => ({
      length: item.measurements?.length || "",
      width: item.measurements?.width || "",
      height: item.measurements?.height || "",
      weight: item.measurements?.weight || "",
    }))
  );

  const updateMeasurement = useCallback((index, field, value) => {
    setMeasurements((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }, []);

  const handleSave = useCallback(() => {
    onSave(measurements);
    onClose();
  }, [measurements, onSave, onClose]);

  const handleClearAll = useCallback(() => {
    const emptyMeasurements = items.map(() => ({
      length: "",
      width: "",
      height: "",
      weight: "",
    }));
    setMeasurements(emptyMeasurements);
    onSave(emptyMeasurements);
    onClose();
  }, [items, onSave, onClose]);

  // Check if any measurements exist
  const hasMeasurements = measurements.some(
    (m) => m.length || m.width || m.height || m.weight
  );

  if (!show) return null;

  return (
    <div className="w-[90%] max-w-[500px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] z-[99999] shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-black font-semibold text-lg">
            Item Measurements
          </h3>
          <p className="text-sm text-themeDarkGray mt-1">
            Add specific measurements for each item (optional)
          </p>
        </div>

        <div onClick={onClose}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Items */}
      <div className="max-h-[400px] overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className="mb-6 pb-4 border-b border-gray-200 last:border-b-0"
          >
            <h4 className="text-sm font-medium text-black mb-3">
              Item {index + 1}: {item.description || "Untitled"}
              <span className="text-themeDarkGray font-normal ml-1">
                (Qty: {item.quantity})
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Length"
                id={`length_${index}`}
                type="number"
                step="0.1"
                suffix="in"
                disabled={!permissions.canEdit}
                value={measurements[index]?.length || ""}
                onChange={(e) =>
                  updateMeasurement(index, "length", e.target.value)
                }
                placeholder="0.0"
              />

              <FormInput
                label="Width"
                id={`width_${index}`}
                type="number"
                step="0.1"
                suffix="in"
                disabled={!permissions.canEdit}
                value={measurements[index]?.width || ""}
                onChange={(e) =>
                  updateMeasurement(index, "width", e.target.value)
                }
                placeholder="0.0"
              />

              <FormInput
                label="Height"
                id={`height_${index}`}
                type="number"
                step="0.1"
                suffix="in"
                disabled={!permissions.canEdit}
                value={measurements[index]?.height || ""}
                onChange={(e) =>
                  updateMeasurement(index, "height", e.target.value)
                }
                placeholder="0.0"
              />

              <FormInput
                label="Weight"
                id={`weight_${index}`}
                type="number"
                step="0.1"
                suffix="lbs"
                disabled={!permissions.canEdit}
                value={measurements[index]?.weight || ""}
                onChange={(e) =>
                  updateMeasurement(index, "weight", e.target.value)
                }
                placeholder="0.0"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full flex items-center gap-2.5 mt-4">
        <button
          onClick={onClose}
          className="w-full text-themeDarkGray py-2.5 border border-secondaryBtnBorder font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          Cancel
        </button>

        {hasMeasurements && (
          <button
            onClick={handleClearAll}
            className="w-full text-themeRed py-2.5 border border-themeRed font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
          >
            Clear All
          </button>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-themeOrange py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default MeasurementsPopup;
