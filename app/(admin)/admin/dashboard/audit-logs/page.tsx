"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { Button, LoadingSpinner } from "@/components/admin/ui";
import {
  AuditLog,
  UserActivityResponse,
  GetAuditLogsParams,
  AUDIT_LOG_ACTION_TYPES,
  AuditLogActionType,
} from "@/types/admin.types";
import { formatDateTime } from "@/lib/utils";
import { dashboardService } from "@/services/dashboard.service";
import toast from "react-hot-toast";
import clsx from "clsx";

type TabType = "admin" | "user-issues";

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("admin");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  /** User filter: UUID of user, or "all" */
  const [userFilter, setUserFilter] = useState<string>("all");
  /** Action filter: action_type value, or "all" */
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userActivityPage, setUserActivityPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 10;
  const userActivityPerPage = 10;

  /** User Issues tab filters */
  const [userIssuesSearch, setUserIssuesSearch] = useState("");
  const [userIssuesDateRange, setUserIssuesDateRange] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [userIssuesActionFilter, setUserIssuesActionFilter] =
    useState<string>("all");
  const [userIssuesDatePickerOpen, setUserIssuesDatePickerOpen] =
    useState(false);
  const [userIssuesSelectedRange, setUserIssuesSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const userIssuesDatePickerRef = useRef<HTMLDivElement>(null);

  const uniqueUsers = Array.from(
    new Map(
      auditLogs
        .filter((log) => log.user)
        .map((log) => [
          log.user!,
          { user: log.user!, user_name: log.user_name },
        ])
    ).values()
  );

  const formatActionType = (actionType: string) =>
    actionType
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: GetAuditLogsParams = {};
      if (userFilter !== "all") {
        params.user = userFilter;
      }
      if (actionFilter !== "all") {
        params.action_type = actionFilter as AuditLogActionType;
      }
      if (dateRange[0] && dateRange[1]) {
        params.start_date = dateRange[0].toISOString().split("T")[0];
        params.end_date = dateRange[1].toISOString().split("T")[0];
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const logs = await dashboardService.getAuditLogs(params);
      setAuditLogs(logs);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [userFilter, actionFilter, dateRange, searchQuery]);

  const loadUserActivity = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getUserActivity();
      setUserActivity(data);
    } catch (error) {
      console.error("Error loading user activity:", error);
      setUserActivity(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "admin") {
      loadAuditLogs();
    } else {
      loadUserActivity();
    }
  }, [activeTab, loadAuditLogs, loadUserActivity]);

  useEffect(() => {
    if (activeTab === "admin") {
      loadAuditLogs();
    } else {
      loadUserActivity();
    }
  }, [
    userFilter,
    actionFilter,
    dateRange,
    searchQuery,
    loadAuditLogs,
    loadUserActivity,
    activeTab,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchQuery) return true;
    return (
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_display.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.object_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const filteredUserActivity = (userActivity?.recent_activity ?? []).filter(
    (item) => {
      if (userIssuesSearch) {
        const q = userIssuesSearch.toLowerCase();
        const match =
          item.user_name?.toLowerCase().includes(q) ||
          item.user_email?.toLowerCase().includes(q) ||
          item.action_display?.toLowerCase().includes(q) ||
          item.error_message?.toLowerCase().includes(q) ||
          item.content_type_name?.toLowerCase().includes(q) ||
          item.object_name?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (
        userIssuesActionFilter !== "all" &&
        item.action_type !== userIssuesActionFilter
      )
        return false;
      if (userIssuesDateRange[0] && userIssuesDateRange[1]) {
        const t = new Date(item.timestamp).getTime();
        const from = userIssuesDateRange[0].setHours(0, 0, 0, 0);
        const to = userIssuesDateRange[1].setHours(23, 59, 59, 999);
        if (t < from || t > to) return false;
      }
      return true;
    }
  );

  const totalUserActivityPages = Math.ceil(
    filteredUserActivity.length / userActivityPerPage
  );
  const paginatedUserActivity = filteredUserActivity.slice(
    (userActivityPage - 1) * userActivityPerPage,
    userActivityPage * userActivityPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [userFilter, actionFilter, searchQuery, dateRange]);

  useEffect(() => {
    if (activeTab === "user-issues") setUserActivityPage(1);
  }, [activeTab]);

  useEffect(() => {
    setUserActivityPage(1);
  }, [userIssuesSearch, userIssuesActionFilter, userIssuesDateRange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userIssuesDatePickerRef.current &&
        !userIssuesDatePickerRef.current.contains(e.target as Node)
      ) {
        setUserIssuesDatePickerOpen(false);
      }
    };
    if (userIssuesDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userIssuesDatePickerOpen]);

  const formatDateRange = () => {
    if (dateRange[0] && dateRange[1]) {
      return `${format(dateRange[0], "MM/dd/yy")}-${format(
        dateRange[1],
        "MM/dd/yy"
      )}`;
    }
    return "Select date range";
  };

  const formatDateRangeUserIssues = () => {
    if (userIssuesDateRange[0] && userIssuesDateRange[1]) {
      return `${format(userIssuesDateRange[0], "MM/dd/yy")}-${format(
        userIssuesDateRange[1],
        "MM/dd/yy"
      )}`;
    }
    return "Select date range";
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params: GetAuditLogsParams = {};
      if (userFilter !== "all") {
        params.user = userFilter;
      }
      if (actionFilter !== "all") {
        params.action_type = actionFilter as AuditLogActionType;
      }
      if (dateRange[0] && dateRange[1]) {
        params.start_date = dateRange[0].toISOString().split("T")[0];
        params.end_date = dateRange[1].toISOString().split("T")[0];
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const blob = await dashboardService.exportAuditLogs(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Audit logs exported successfully");
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      toast.error("Failed to export audit logs");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-medium text-admin-primary mb-1">
              Audit logs
            </h1>
            <p className="text-sm text-admin-primary/60">
              Track admin actions and monitor platform issues
            </p>
          </div>
        </div>

        <div className="bg-[#1A1A1A0A] rounded-[10px] py-8">
          <div className="flex items-center justify-between mb-6 px-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("admin")}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === "admin"
                    ? "bg-admin-primary text-white"
                    : "bg-white border border-accent-2 text-admin-primary hover:bg-accent-1"
                )}
              >
                Admin audit log
              </button>
              <button
                onClick={() => setActiveTab("user-issues")}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === "user-issues"
                    ? "bg-admin-primary text-white"
                    : "bg-white border border-accent-2 text-admin-primary hover:bg-accent-1"
                )}
              >
                User Issues
              </button>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="bg-admin-primary text-white hover:bg-admin-primary/90 flex items-center gap-2"
            >
              <Download size={16} />
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>

          {activeTab === "admin" && (
            <div className="px-6 flex items-center justify-between">
              <div className="mb-4">
                <p className="text-sm text-admin-primary/60 mb-1">Total logs</p>
                <p className="text-2xl font-bold text-admin-primary">
                  {filteredLogs.length}
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-grey"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-accent-2 rounded-lg focus:outline-none"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-[120px] truncate px-4 py-2 bg-white border border-accent-2 rounded-lg focus:outline-none text-sm"
                >
                  <option value="all">All admin</option>
                  {uniqueUsers.map((u) => (
                    <option key={u.user} value={u.user}>
                      {u.user_name}
                    </option>
                  ))}
                </select>
                <div className="relative" ref={datePickerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDatePickerOpen(!isDatePickerOpen);
                      if (!isDatePickerOpen) {
                        setSelectedRange({
                          from: dateRange[0] || undefined,
                          to: dateRange[1] || undefined,
                        });
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-accent-2 rounded-lg text-sm transition-all text-admin-primary hover:bg-accent-1"
                  >
                    <Calendar size={16} className="shrink-0" />
                    <span className="whitespace-nowrap">
                      {formatDateRange()}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isDatePickerOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDatePickerOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-accent-2 p-4">
                      <DayPicker
                        mode="range"
                        selected={selectedRange}
                        onSelect={(range) => {
                          setSelectedRange({
                            from: range?.from,
                            to: range?.to,
                          });
                        }}
                        numberOfMonths={1}
                        className="custom-day-picker"
                      />
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-accent-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRange({
                              from: undefined,
                              to: undefined,
                            });
                            setDateRange([null, null]);
                            setIsDatePickerOpen(false);
                          }}
                          className="px-4 py-2 text-sm text-admin-primary hover:bg-accent-2 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedRange.from && selectedRange.to) {
                              setDateRange([
                                selectedRange.from,
                                selectedRange.to,
                              ]);
                              setIsDatePickerOpen(false);
                            }
                          }}
                          disabled={!selectedRange.from || !selectedRange.to}
                          className="px-4 py-2 text-sm bg-admin-primary text-white rounded-lg transition-colors hover:bg-admin-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-[160px] px-4 py-2 bg-white border border-accent-2 rounded-lg focus:outline-none text-sm"
                >
                  <option value="all">All action</option>
                  {AUDIT_LOG_ACTION_TYPES.map((actionType) => (
                    <option key={actionType} value={actionType}>
                      {formatActionType(actionType)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === "admin" ? (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : paginatedLogs.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-admin-primary/60">No audit logs found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-accent-2">
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Admin ID
                        </th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Action performed
                        </th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Entity type
                        </th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Entity ID
                        </th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLogs.map((log, index) => {
                        return (
                          <tr
                            key={log.id}
                            className={clsx(
                              "not-last:border-b border-accent-2",
                              index % 2 === 0 ? "bg-white" : "bg-accent-1"
                            )}
                          >
                            <td className="px-6 py-2 text-admin-primary">
                              <div>
                                <p className="font-medium">{log.user_name}</p>
                                {log.ip_address && (
                                  <p className="text-sm text-admin-primary/60">
                                    {log.ip_address}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-2 text-admin-primary">
                              {log.action_display}
                            </td>
                            <td className="px-6 py-2 text-admin-primary capitalize">
                              {log.content_type_name || "-"}
                            </td>
                            <td className="px-6 py-2 text-admin-primary">
                              {log.object_name}
                            </td>
                            <td className="px-6 py-2 text-admin-primary">
                              {formatDateTime(log.timestamp)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="px-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !userActivity ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-admin-primary/60">No recent activity</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="mb-4">
                      <p className="text-sm text-admin-primary/60 mb-1">
                        Total issues
                      </p>
                      <p className="text-2xl font-bold text-admin-primary">
                        {filteredUserActivity.length || 0}
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-grey"
                          size={20}
                        />
                        <input
                          type="text"
                          placeholder="Search logs..."
                          value={userIssuesSearch}
                          onChange={(e) => setUserIssuesSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white border border-accent-2 rounded-lg focus:outline-none"
                        />
                      </div>
                      <div className="relative" ref={userIssuesDatePickerRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setUserIssuesDatePickerOpen(
                              !userIssuesDatePickerOpen
                            );
                            if (!userIssuesDatePickerOpen) {
                              setUserIssuesSelectedRange({
                                from: userIssuesDateRange[0] || undefined,
                                to: userIssuesDateRange[1] || undefined,
                              });
                            }
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-white border border-accent-2 rounded-lg text-sm transition-all text-admin-primary hover:bg-accent-1"
                        >
                          <Calendar size={16} className="shrink-0" />
                          <span className="whitespace-nowrap">
                            {formatDateRangeUserIssues()}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${
                              userIssuesDatePickerOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {userIssuesDatePickerOpen && (
                          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-accent-2 p-4">
                            <DayPicker
                              mode="range"
                              selected={userIssuesSelectedRange}
                              onSelect={(range) => {
                                setUserIssuesSelectedRange({
                                  from: range?.from,
                                  to: range?.to,
                                });
                              }}
                              numberOfMonths={1}
                              className="custom-day-picker"
                            />
                            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-accent-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setUserIssuesSelectedRange({
                                    from: undefined,
                                    to: undefined,
                                  });
                                  setUserIssuesDateRange([null, null]);
                                  setUserIssuesDatePickerOpen(false);
                                }}
                                className="px-4 py-2 text-sm text-admin-primary hover:bg-accent-2 rounded-lg transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    userIssuesSelectedRange.from &&
                                    userIssuesSelectedRange.to
                                  ) {
                                    setUserIssuesDateRange([
                                      userIssuesSelectedRange.from,
                                      userIssuesSelectedRange.to,
                                    ]);
                                    setUserIssuesDatePickerOpen(false);
                                  }
                                }}
                                disabled={
                                  !userIssuesSelectedRange.from ||
                                  !userIssuesSelectedRange.to
                                }
                                className="px-4 py-2 text-sm bg-admin-primary text-white rounded-lg transition-colors hover:bg-admin-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <select
                        value={userIssuesActionFilter}
                        onChange={(e) =>
                          setUserIssuesActionFilter(e.target.value)
                        }
                        className="w-[160px] px-4 py-2 bg-white border border-accent-2 rounded-lg focus:outline-none text-sm"
                      >
                        <option value="all">All action</option>
                        {AUDIT_LOG_ACTION_TYPES.map((actionType) => (
                          <option key={actionType} value={actionType}>
                            {formatActionType(actionType)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredUserActivity.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-admin-primary/60">No issues found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-accent-2">
                            <th className="text-left font-medium text-admin-primary px-6 py-4">
                              IP Address
                            </th>
                            <th className="text-left font-medium text-admin-primary px-6 py-4">
                              Error message
                            </th>
                            <th className="text-left font-medium text-admin-primary px-6 py-4">
                              Issue type
                            </th>
                            <th className="text-left font-medium text-admin-primary px-6 py-4">
                              Service
                            </th>
                            <th className="text-left font-medium text-admin-primary px-6 py-4">
                              Entity ID
                            </th>
                            <th className="text-left font-medium text-admin-primary px-6 py-4">
                              Timestamp
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUserActivity.map((item, index) => (
                            <tr
                              key={item.id}
                              className={clsx(
                                "not-last:border-b border-accent-2",
                                index % 2 === 0 ? "bg-white" : "bg-accent-1"
                              )}
                            >
                              <td className="px-6 py-4 text-admin-primary font-medium">
                                {item.ip_address || "-"}
                              </td>
                              <td className="px-6 py-4 text-admin-primary">
                                {item.error_message || "-"}
                              </td>
                              <td className="px-6 py-4 text-admin-primary">
                                {item.action_display}
                              </td>
                              <td className="px-6 py-4 text-admin-primary capitalize">
                                {item.content_type_name || "-"}
                              </td>
                              <td className="px-6 py-4 text-admin-primary">
                                {item.object_name || "-"}
                              </td>
                              <td className="px-6 py-4 text-admin-primary">
                                {formatDateTime(item.timestamp)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "admin" && filteredLogs.length > 0 && (
            <div className="flex items-center justify-end gap-2 mt-10 px-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={clsx(
                  "px-3 py-2 rounded-lg border border-accent-2 transition-colors flex items-center gap-1 text-sm",
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed text-grey"
                    : "text-admin-primary hover:bg-accent-1"
                )}
              >
                <ChevronLeft size={18} />
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={clsx(
                      "px-3 py-2 rounded-lg border transition-colors text-sm",
                      currentPage === page
                        ? "bg-admin-primary text-white border-admin-primary"
                        : "border-accent-2 text-admin-primary hover:bg-accent-1"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={clsx(
                  "px-3 py-2 rounded-lg border border-accent-2 transition-colors flex items-center gap-1 text-sm",
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed text-grey"
                    : "text-admin-primary hover:bg-accent-1"
                )}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {activeTab === "user-issues" &&
            filteredUserActivity.length > 0 &&
            totalUserActivityPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-10 px-6">
                <button
                  onClick={() =>
                    setUserActivityPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={userActivityPage === 1}
                  className={clsx(
                    "px-3 py-2 rounded-lg border border-accent-2 transition-colors flex items-center gap-1 text-sm",
                    userActivityPage === 1
                      ? "opacity-50 cursor-not-allowed text-grey"
                      : "text-admin-primary hover:bg-accent-1"
                  )}
                >
                  <ChevronLeft size={18} />
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    {
                      length: Math.min(totalUserActivityPages, 5),
                    },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setUserActivityPage(page)}
                      className={clsx(
                        "px-3 py-2 rounded-lg border transition-colors text-sm",
                        userActivityPage === page
                          ? "bg-admin-primary text-white border-admin-primary"
                          : "border-accent-2 text-admin-primary hover:bg-accent-1"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setUserActivityPage((prev) =>
                      Math.min(totalUserActivityPages, prev + 1)
                    )
                  }
                  disabled={userActivityPage === totalUserActivityPages}
                  className={clsx(
                    "px-3 py-2 rounded-lg border border-accent-2 transition-colors flex items-center gap-1 text-sm",
                    userActivityPage === totalUserActivityPages
                      ? "opacity-50 cursor-not-allowed text-grey"
                      : "text-admin-primary hover:bg-accent-1"
                  )}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
