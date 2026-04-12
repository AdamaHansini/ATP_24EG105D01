import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";
import {
  pageBackground,
  pageWrapper,
  headingClass,
  cardClass,
  mutedText,
  primaryBtn,
  secondaryBtn,
  errorClass,
  successClass,
  emptyStateClass,
} from "../styles/common";

function AdminProfile() {
  const currentUser = useAuth((state) => state.currentUser);
  const [managedAccounts, setManagedAccounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/admin-api/users", {
        withCredentials: true,
      });
      setManagedAccounts(res.data.payload.users || []);
      setStats(res.data.payload.stats || null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const toggleStatus = async (account) => {
    try {
      const updatedStatus = !account.isUserActive;
      await axios.patch(
        `http://localhost:5000/admin-api/users/${account._id}/status`,
        { isUserActive: updatedStatus },
        { withCredentials: true },
      );
      toast.success(
        `${account.role} ${updatedStatus ? "unblocked" : "blocked"} successfully`,
      );
      fetchAccounts();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Could not update account status",
      );
    }
  };

  return (
    <div className={`${pageBackground} py-12`}>
      <div className={pageWrapper}>
        <div className="mb-8">
          <h1 className={headingClass}>Admin Dashboard</h1>
          <p className={mutedText}>
            Welcome back, {currentUser?.firstName} {currentUser?.lastName}.
            Manage users and authors from here.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-4 mb-8">
          <div className={`${cardClass} p-6`}>
            <h2 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-[0.18em] mb-2">
              Total accounts
            </h2>
            <p className="text-4xl font-bold text-[#1d1d1f]">
              {stats?.totalAccounts ?? "--"}
            </p>
          </div>
          <div className={`${cardClass} p-6`}>
            <h2 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-[0.18em] mb-2">
              Authors
            </h2>
            <p className="text-4xl font-bold text-[#1d1d1f]">
              {stats?.totalAuthors ?? "--"}
            </p>
          </div>
          <div className={`${cardClass} p-6`}>
            <h2 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-[0.18em] mb-2">
              Users
            </h2>
            <p className="text-4xl font-bold text-[#1d1d1f]">
              {stats?.totalUsers ?? "--"}
            </p>
          </div>
          <div className={`${cardClass} p-6`}>
            <h2 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-[0.18em] mb-2">
              Blocked accounts
            </h2>
            <p className="text-4xl font-bold text-[#1d1d1f]">
              {stats?.blockedAccounts ?? "--"}
            </p>
          </div>
        </div>

        <div className={`${cardClass} p-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className={headingClass}>Managed accounts</h2>
              <p className={mutedText}>
                Block or unblock registered users and authors.
              </p>
            </div>
            <button onClick={fetchAccounts} className={secondaryBtn}>
              Refresh list
            </button>
          </div>

          {loading && <p className={mutedText}>Loading accounts...</p>}
          {error && <p className={errorClass}>{error}</p>}

          {!loading && !error && managedAccounts.length === 0 && (
            <p className={emptyStateClass}>
              No users or authors to manage yet.
            </p>
          )}

          {!loading && !error && managedAccounts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
                      Role
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {managedAccounts.map((account) => (
                    <tr
                      key={account._id}
                      className="bg-white border border-[#e8e8ed] rounded-3xl"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-[#1d1d1f]">
                        {account.firstName} {account.lastName}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#6e6e73]">
                        {account.role}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#6e6e73]">
                        {account.email}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={
                            account.isUserActive ? successClass : errorClass
                          }
                        >
                          {account.isUserActive ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleStatus(account)}
                          className={`${primaryBtn} ${account.isUserActive ? "bg-[#ff3b30] hover:bg-[#d62c23]" : "bg-[#0066cc] hover:bg-[#004499]"}`}
                        >
                          {account.isUserActive ? "Block" : "Unblock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
