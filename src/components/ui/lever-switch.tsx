import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface LeverSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const LeverSwitch = React.forwardRef<HTMLInputElement, LeverSwitchProps>(
  ({ className, id, ...props }, ref) => {
    const generatedId = useId();
    const switchId = id || generatedId;

    return (
      <label
        htmlFor={switchId}
        className={cn(
          "toggle-container scale-75 md:scale-100 cursor-pointer",
          className,
        )}
      >
        <input
          id={switchId}
          className="toggle-input"
          type="checkbox"
          ref={ref}
          {...props}
        />
        <div className="toggle-handle-wrapper">
          <div className="toggle-handle">
            <div className="toggle-handle-knob"></div>
            <div className="toggle-handle-bar-wrapper">
              <div className="toggle-handle-bar"></div>
            </div>
          </div>
        </div>
        <div className="toggle-base">
          <div className="toggle-base-inside"></div>
        </div>
      </label>
    );
  },
);

LeverSwitch.displayName = "LeverSwitch";
