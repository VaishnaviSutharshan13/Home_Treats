import {
  FaBed,
  FaCheck,
  FaComments,
  FaDollarSign,
  FaExclamationTriangle,
  FaFileInvoiceDollar,
  FaHistory,
  FaHome,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: "admin" | "student";
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const adminMenuItems = [
    {
      title: "Dashboard",
      icon: <FaTachometerAlt className="h-5 w-5" />,
      href: "/admin/dashboard",
    },
    {
      title: "Students",
      icon: <FaUsers className="h-5 w-5" />,
      href: "/admin/student-management",
    },
    {
      title: "Approvals",
      icon: <FaCheck className="h-5 w-5" />,
      href: "/admin/approvals",
    },
    {
      title: "Rooms",
      icon: <FaBed className="h-5 w-5" />,
      href: "/admin/room-management",
    },
    {
      title: "Fees",
      icon: <FaDollarSign className="h-5 w-5" />,
      href: "/admin/fees-management",
    },
    {
      title: "Complaints",
      icon: <FaExclamationTriangle className="h-5 w-5" />,
      href: "/admin/complaint-management",
    },
    {
      title: "Activity Log",
      icon: <FaHistory className="h-5 w-5" />,
      href: "/admin/activity-log",
    },
    {
      title: "Profile",
      icon: <FaUser className="h-5 w-5" />,
      href: "/admin/profile",
    },
  ];

  const studentMenuItems = [
    {
      title: "Home",
      icon: <FaHome className="h-5 w-5" />,
      href: "/student/dashboard",
    },
    {
      title: "My Room",
      icon: <FaBed className="h-5 w-5" />,
      href: "/student/my-room",
    },
    {
      title: "Book Room",
      icon: <FaBed className="h-5 w-5" />,
      href: "/student/book-room",
    },
    {
      title: "Payments",
      icon: <FaFileInvoiceDollar className="h-5 w-5" />,
      href: "/student/my-fees",
    },
    {
      title: "Complaints",
      icon: <FaComments className="h-5 w-5" />,
      href: "/student/my-complaints",
    },
    {
      title: "Profile",
      icon: <FaUser className="h-5 w-5" />,
      href: "/student/profile",
    },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : studentMenuItems;

  const isActiveLink = (href: string) => location.pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
          aria-hidden
        />
      )}

      <div
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 transform flex-col border-r border-border bg-sidebar shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/30">
              <span className="text-sm font-bold text-primary-foreground">
                GT
              </span>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-sidebar-foreground">
                Home Treats
              </h2>
              <p className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
                {userRole === "admin" ? "Admin" : "Student"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            title="Close sidebar"
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground lg:hidden"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.title}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-active text-sidebar-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    active
                      ? "bg-primary/20 text-info"
                      : "bg-sidebar-hover/50 text-sidebar-muted group-hover:text-sidebar-foreground"
                  }`}
                >
                  {item.icon}
                </div>
                <span>{item.title}</span>
              </Link>
            );
          })}

          <div className="!mt-4 border-t border-border pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-error/15 hover:text-error"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-hover/50 transition-colors group-hover:bg-error/20">
                <FaSignOutAlt className="h-4 w-4" />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </nav>

        <div className="shrink-0 border-t border-border bg-sidebar-hover/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-primary/20">
              <span className="text-[10px] font-bold text-info">GT</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-sidebar-foreground">
                Home Treats
              </p>
              <p className="text-[10px] text-sidebar-muted">
                Hostel management
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
