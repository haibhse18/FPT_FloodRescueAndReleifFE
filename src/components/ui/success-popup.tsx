"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function SuccessPopup({
    isOpen,
    onClose,
    title = "Thành công!",
    message = "Yêu cầu của bạn đã được gửi đi"
}: SuccessPopupProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <span className="text-4xl">✓</span>
                    </div>
                    <DialogTitle className="text-center text-2xl">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center pt-4">
                    <Button onClick={onClose} className="w-full">
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
