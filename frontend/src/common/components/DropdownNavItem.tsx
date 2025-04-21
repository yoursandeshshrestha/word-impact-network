import React, { useRef } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  label: string;
  href: string;
}

interface DropdownColumn {
  title: string;
  items: DropdownItem[];
}

interface DropdownProps {
  label: string;
  columns: DropdownColumn[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const DropdownNavItem: React.FC<DropdownProps> = ({
  label,
  columns,
  isOpen,
  onOpen,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors text-sm font-medium py-2"
        onClick={() => (isOpen ? onClose() : onOpen())}
        onMouseEnter={onOpen}
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[40px] z-10 mt-2 w-screen max-w-md transform px-4 sm:px-0 lg:max-w-2xl"
          onMouseLeave={onClose}
        >
          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="relative grid gap-8 bg-white p-7 grid-cols-2">
              {columns.map((column, idx) => (
                <div key={idx} className="space-y-4">
                  <p className="text-base font-medium text-gray-900">
                    {column.title}
                  </p>
                  <ul className="space-y-3">
                    {column.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <a
                          href={item.href}
                          className="text-sm text-gray-600 hover:text-black transition-colors"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownNavItem;
