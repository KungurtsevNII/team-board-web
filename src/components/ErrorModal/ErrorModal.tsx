import { useEffect, useRef } from "react";
import "./ErrorModal.css";

interface ErrorModalProps {
    text: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ErrorModal = ({ text, isOpen, onClose }: ErrorModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    if (!text) text = "Произошла ошибка!"
    // Закрытие при нажатии Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Закрытие при клике на backdrop (фон)
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="err-modal-backdrop" onClick={handleBackdropClick}>
            <div className="err-modal-content" ref={modalRef}>
                <div className="err-modal-header">
                        <h2 className="err-modal-title">Произошла ошибка!</h2>
                </div>
                <div className="err-modal-body">
                    {text}
                </div>
            </div>
        </div>
    );
};
