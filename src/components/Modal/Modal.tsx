import { useEffect, useRef } from "react";
import "./Modal.css";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    iconPath?: string;
}

export const Modal = ({ isOpen, onClose, children, title, iconPath }: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

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

    // Блокировка скролла body при открытом модале
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
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content" ref={modalRef}>
                <div className="modal-header">
                    <img className="modal-icon"src={iconPath} alt="alt"/>
                    {title && <h2 className="modal-title">{title}</h2>}
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};
