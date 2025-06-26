import { useState } from "react";
import { Button } from "react-bootstrap";

const CustomDropdown = ({ title, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Button onClick={() => setIsOpen(!isOpen)} variant="secondary">
        {title}
      </Button>
      {isOpen && (
        <div className="dropdown-menu show">
          {options.map((option, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;