'use client'

import Image from "next/image";
import Container from "@/components/layout/Container";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useState, useEffect } from "react";
import { Mail, Calendar, MapPin, Shield, User, Clock } from "lucide-react";

interface ProfileContentProps {
  user: any | null;
}

export default function ProfileContent({ user: serverUser }: ProfileContentProps) {
  const [imageError, setImageError] = useState(false);
  const [user, setUser] = useState(serverUser);

  // Sync with cookie changes (for when profile is updated)
  useEffect(() => {
    const syncUserData = () => {
      try {
        const cookieUser = document.cookie
          .split('; ')
          .find(row => row.startsWith('user='))
          ?.split('=')[1];

        if (cookieUser && cookieUser !== 'undefined') {
          const parsedUser = JSON.parse(decodeURIComponent(cookieUser));
          if (parsedUser && typeof parsedUser === 'object') {
            console.log("ProfileContent - synced user data:", parsedUser);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Error syncing user data:", error);
      }
    };

    // Sync on mount and when coming back to the page
    syncUserData();

    // Listen for visibility change (user switching tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible - syncing user data");
        syncUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!user) {
    return (
      <Container>
        <section className="mt-8">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Not signed in</EmptyTitle>
              <EmptyDescription>You need to sign in to view your profile.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </section>
      </Container>
    );
  }

  const name = user?.userName || user?.name || user?.fullName || user?.email || 'User';
  const role = user?.role || user?.title || 'Analyst';
  const email = user?.email || null;
  const location = user?.location || user?.city || null;
  const joinDate = user?.createdAt || user?.joinDate || user?.registeredAt || null;
  const bio = user?.bio || user?.description || null;
  const department = user?.department || user?.team || null;
  const phone = user?.phone || user?.phoneNumber || null;
  
  const defaultAvatar = '/avatar-placeholder.png';
  const avatarSrc = !imageError ? (user?.avatar || user?.profileImage || defaultAvatar) : defaultAvatar;
  const coverImage = user?.coverImage || user?.banner || null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Container>
      <section>
        {/* Cover Image */}
        <div className="h-64 mt-9">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            {coverImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={coverImage}
                  alt="Profile cover"
                  fill
                  className="object-cover rounded-2xl"
                  priority
                  onError={() => {
                    const element = document.querySelector('.cover-fallback');
                    if (element) element.classList.remove('hidden');
                  }}
                />
                <div className="cover-fallback hidden absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/80 to-primary" />
              </div>
            ) : (
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-primary/80 to-primary" />
            )}
          </div>
        </div>

        {/* Profile Header */}
        <div className="-mt-20 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end">
            <div 
              className="relative w-40 h-40 flex items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg"
              suppressHydrationWarning
            >
              <Image
                src={avatarSrc}
                alt={`${name}'s profile picture`}
                width={160}
                height={160}
                className="object-cover"
                priority
                onError={() => {
                  setImageError(true);
                }}
              />
            </div>
            <div className="flex flex-col items-center sm:items-start pb-4 bg-background/95 backdrop-blur-sm px-6 py-3 rounded-lg">
              <h1 className="text-4xl tracking-tight font-bold text-foreground">
                {name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground font-medium">{role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:px-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {bio && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  About
                </h2>
                <p className="text-muted-foreground leading-relaxed">{bio}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                {email && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{phone}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info Cards */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
              <div className="space-y-4">
                {department && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Department</p>
                    <p className="font-medium">{department}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <Shield className="w-3 h-3" />
                    {role}
                  </div>
                </div>
                {joinDate && (
                  <div className="flex items-start gap-3 pt-2 border-t border-border">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member since</p>
                      <p className="font-medium">{formatDate(joinDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Last seen</span>
                  <span className="font-medium">Recently</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        {user?.additionalInfo && (
          <div className="mt-6 sm:px-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(user.additionalInfo).map(([key, value]) => (
                  <div key={key} className="border-l-2 border-primary/30 pl-4">
                    <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="font-medium mt-1">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </Container>
  );
}