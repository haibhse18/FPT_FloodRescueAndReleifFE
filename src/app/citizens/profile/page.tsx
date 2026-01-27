"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import API from "@/lib/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: "Nguyễn Văn A",
        phone: "0123456789",
        email: "nguyenvana@example.com",
        address: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
        emergencyContact: "0987654321",
        emergencyContactName: "Nguyễn Thị B"
    });

    const [editedProfile, setEditedProfile] = useState(profile);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const userData = await API.auth.getCurrentUser() as any;
                const newProfile = {
                    name: userData.fullName || "Nguyễn Văn A",
                    phone: userData.phone || "0123456789",
                    email: userData.email || "nguyenvana@example.com",
                    address: userData.address || "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
                    emergencyContact: userData.emergencyContact || "0987654321",
                    emergencyContactName: userData.emergencyContactName || "Nguyễn Thị B"
                };
                setProfile(newProfile);
                setEditedProfile(newProfile);
            } catch (error) {
                console.error("Lỗi khi tải thông tin cá nhân:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await API.citizen.updateProfile(editedProfile);
            setProfile(editedProfile);
            setIsEditMode(false);
        } catch (error) {
            console.error("Lỗi khi lưu thông tin:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditMode(false);
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">Thông tin cá nhân</h1>
                    <p className="text-gray-400">Quản lý thông tin tài khoản của bạn</p>
                </div>
            </div>

            {/* Profile Card */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-20 h-20">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-orange-600 text-white text-2xl font-bold">
                                    {profile.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-white text-xl">{profile.name}</CardTitle>
                                <CardDescription className="text-gray-400">Công dân</CardDescription>
                            </div>
                        </div>

                        {!isEditMode && (
                            <Button
                                variant="outline"
                                onClick={() => setIsEditMode(true)}
                                className="bg-white/5 hover:bg-white/10 border-white/20"
                            >
                                ✏️ Chỉnh sửa
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span>👤</span> Thông tin cá nhân
                        </h3>
                        <Separator className="bg-white/10" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-300">Họ và tên</Label>
                                {isEditMode ? (
                                    <Input
                                        id="name"
                                        value={editedProfile.name}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                        className="bg-white/5 border-white/20 text-white"
                                    />
                                ) : (
                                    <p className="text-white p-2 bg-white/5 rounded-md">{profile.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-300">Số điện thoại</Label>
                                {isEditMode ? (
                                    <Input
                                        id="phone"
                                        value={editedProfile.phone}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                        className="bg-white/5 border-white/20 text-white"
                                    />
                                ) : (
                                    <p className="text-white p-2 bg-white/5 rounded-md">{profile.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email" className="text-gray-300">Email</Label>
                                {isEditMode ? (
                                    <Input
                                        id="email"
                                        type="email"
                                        value={editedProfile.email}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                        className="bg-white/5 border-white/20 text-white"
                                    />
                                ) : (
                                    <p className="text-white p-2 bg-white/5 rounded-md">{profile.email}</p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address" className="text-gray-300">Địa chỉ</Label>
                                {isEditMode ? (
                                    <Input
                                        id="address"
                                        value={editedProfile.address}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                                        className="bg-white/5 border-white/20 text-white"
                                    />
                                ) : (
                                    <p className="text-white p-2 bg-white/5 rounded-md">{profile.address}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span>🆘</span> Liên hệ khẩn cấp
                        </h3>
                        <Separator className="bg-white/10" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactName" className="text-gray-300">
                                    Tên người liên hệ
                                </Label>
                                {isEditMode ? (
                                    <Input
                                        id="emergencyContactName"
                                        value={editedProfile.emergencyContactName}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, emergencyContactName: e.target.value })}
                                        className="bg-white/5 border-white/20 text-white"
                                    />
                                ) : (
                                    <p className="text-white p-2 bg-white/5 rounded-md">{profile.emergencyContactName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="emergencyContact" className="text-gray-300">
                                    Số điện thoại khẩn cấp
                                </Label>
                                {isEditMode ? (
                                    <Input
                                        id="emergencyContact"
                                        value={editedProfile.emergencyContact}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, emergencyContact: e.target.value })}
                                        className="bg-white/5 border-white/20 text-white"
                                    />
                                ) : (
                                    <p className="text-white p-2 bg-white/5 rounded-md">{profile.emergencyContact}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditMode && (
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isSaving ? "Đang lưu..." : "💾 Lưu thay đổi"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="bg-white/5 hover:bg-white/10 border-white/20"
                            >
                                Hủy
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Additional Actions */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Cài đặt tài khoản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start bg-white/5 hover:bg-white/10 border-white/20"
                    >
                        🔑 Đổi mật khẩu
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start bg-white/5 hover:bg-white/10 border-white/20 text-red-400 hover:text-red-300"
                    >
                        🚪 Đăng xuất
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
