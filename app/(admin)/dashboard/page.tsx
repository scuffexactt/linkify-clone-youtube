import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { Protect } from '@clerk/nextjs';
import { Lock } from 'lucide-react';

import UsernameForm from '@/components/UsernameForm';
import CustomizationForm from '@/components/CustomizationForm';
import ManageLinks from '@/components/ManageLinks';
import DashboardMetrics from '@/components/DashboardMetrics';

import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';
import { fetchAnalytics } from '@/lib/analytics-server';

async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-600">
        You must be logged in to view this page.
      </div>
    );
  }

  const [preloadedLinks, analytics] = await Promise.all([
    preloadQuery(api.lib.links.getLinksByUserId, { userId: user.id }),
    fetchAnalytics(user.id),
  ]);

  return (
    <div>
      {/* 🔒 Premium-only Analytics Section */}
      <Protect
        feature="analytics"
        fallback={
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gray-400 rounded-xl">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Analytics Overview
                    </h2>
                    <p className="text-gray-600">
                      Upgrade to Pro/Ultra to unlock analytics
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="bg-gray-100 rounded-lg p-4 text-center w-full">
                    <p className="text-gray-500">
                      Get detailed insights into your link performance with our Pro and Ultra plans
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <DashboardMetrics analytics={analytics} />
      </Protect>

      {/* 📝 Username customization */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-sl shadow-gray-200/50">
            <UsernameForm />
          </div>
        </div>
      </div>

      {/* 🎨 Page Customization */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <CustomizationForm />
        </div>
      </div>

      {/* 🔗 Manage Links */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">
            {/* Sidebar */}
            <div className="lg:w-2/5 lg:sticky lg:top-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Manage Your Links
                  </h1>
                  <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-4" />
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Organize and customize your link-in-bio page. Drag and drop to reorder,
                  edit details, or remove links that are no longer needed.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-600">Drag & drop to reorder</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-gray-600">Real-time updates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-600">Click tracking analytics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Link Management UI */}
            <div className="lg:w-3/5">
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Links</h2>
                  <p className="text-gray-500">
                    Drag to reorder, click to edit, or delete unwanted links.
                  </p>
                </div>
                <ManageLinks preloadedLinks={preloadedLinks} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
