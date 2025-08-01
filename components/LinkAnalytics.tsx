import { LinkAnalyticsData } from "@/lib/link-analytics-server";
import { Protect } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  Users,
  MousePointer,
  Globe,
  TrendingUp,
  ExternalLink,
  ArrowLeft,
  BarChart3,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface LinkAnalyticsProps {
  analytics: LinkAnalyticsData;
}

async function LinkAnalytics({ analytics }: LinkAnalyticsProps) {
  const { has } = await auth();
  const hasAnalyticsAccess = has({ feature: "analytics" });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  if (!hasAnalyticsAccess) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gray-400 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Link Analytics</h2>
                <p className="text-gray-600">Upgrade to unlock powerful insights</p>
              </div>
            </div>
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4 text-gray-600">
                <MousePointer className="w-5 h-5" />
                <span>Track total clicks and engagement</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <Users className="w-5 h-5" />
                <span>Monitor unique visitors</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <Globe className="w-5 h-5" />
                <span>See geographic distribution</span>
              </div>
            </div>
            <div className="mt-8 bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">
                Get detailed insights into your link performance with our Pro and Ultra plans
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxClicks = Math.max(...analytics.dailyData.map((d) => d.clicks));

  return (
    <div>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{analytics.linkTitle}</h1>
              <Link href={analytics.linkUrl} className="flex items-center gap-2 text-gray-600">
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">{formatUrl(analytics.linkUrl)}</span>
              </Link>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard
                title="Total Clicks"
                icon={<MousePointer className="w-6 h-6 text-white" />}
                value={analytics.totalClicks}
                color="blue"
              />
              <SummaryCard
                title="Unique Users"
                icon={<Users className="w-6 h-6 text-white" />}
                value={analytics.uniqueUsers}
                color="purple"
              />
              <Protect
                plan="ultra"
                fallback={
                  <LockedCard title="Countries" color="green" icon={<Globe className="w-6 h-6 text-white/75" />} />
                }
              >
                <SummaryCard
                  title="Countries"
                  icon={<Globe className="w-6 h-6 text-white" />}
                  value={analytics.countriesReached}
                  color="green"
                />
              </Protect>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Chart */}
      {analytics.dailyData.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
              <SectionHeader
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                title="Daily Performance"
                description="Last 30 days activity"
              />
              <div className="space-y-4">
                {analytics.dailyData.slice(0, 10).map((day) => {
                  const width = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;
                  return (
                    <div key={day.date} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-gray-600 font-medium">{formatDate(day.date)}</div>
                      <div className="flex-1 relative">
                        <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${width}%` }}
                            role="progressbar"
                            aria-valuenow={day.clicks}
                            aria-valuemin={0}
                            aria-valuemax={maxClicks}
                          />
                          <div className="absolute inset-0 flex items-center px-3">
                            <span className="text-sm font-medium text-white">{day.clicks} clicks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{day.uniqueUsers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <span>{day.countries}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {analytics.dailyData.length > 10 && (
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm">Showing last 10 days ({analytics.dailyData.length} total)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Country Analytics */}
      <Protect
        plan="ultra"
        fallback={
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl p-8 shadow-xl shadow-gray-200/50 text-center">
                <SectionHeader
                  icon={<Globe className="w-6 h-6 text-white" />}
                  title="Countries"
                  description="Upgrade to Ultra to unlock country analytics"
                />
              </div>
            </div>
          </div>
        }
      >
        {analytics.countryData.length > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
                <SectionHeader
                  icon={<Globe className="w-6 h-6 text-white" />}
                  title="Countries"
                  description="Click distribution by country"
                />
                <div className="space-y-3">
                  {analytics.countryData.map((country) => (
                    <div key={country.country} className="flex items-center gap-4">
                      <div className="w-32 text-sm text-gray-900 font-medium truncate">{country.country}</div>
                      <div className="flex-1 relative">
                        <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${country.percentage ?? 0}%` }}
                            role="progressbar"
                            aria-valuenow={country.percentage ?? 0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                          <div className="absolute inset-0 flex items-center px-3">
                            <span className="text-xs font-medium text-white">{country.clicks} clicks</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-sm font-medium text-gray-600">
                          {(country.percentage ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {analytics.countryData.length >= 20 && (
                  <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">Showing top 20 countries</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Protect>

      {/* Empty State */}
      {analytics.dailyData.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50 text-center">
              <div className="text-gray-400 mb-4">
                <BarChart3 className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No analytics data yet</h3>
              <p className="text-gray-600">Analytics will appear here once this link starts receiving clicks.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  icon,
  value,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  value: number;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-2xl border border-${color}-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-500 rounded-xl`}>{icon}</div>
        <div className={`text-${color}-600`}>
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className={`text-sm font-medium text-${color}-600 mb-1`}>{title}</p>
        <p className={`text-3xl font-bold text-${color}-900`}>{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function LockedCard({
  title,
  color,
  icon,
}: {
  title: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-2xl border border-${color}-200 opacity-75`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-500/50 rounded-xl`}>{icon}</div>
        <div className={`${color}-600/75`}>
          <Lock className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className={`text-sm font-medium text-${color}-600/75 mb-1`}>{title}</p>
        <p className={`text-3xl font-bold text-${color}-900/75`}>Upgrade to Ultra</p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-slate-500 rounded-xl">{icon}</div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export default LinkAnalytics;
