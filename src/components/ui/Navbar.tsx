import { Link, useLocation } from "react-router-dom";
import { Button, Avatar, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from "@fluentui/react-components";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";

const NAV_LINKS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD },
  { label: "My Quizzes", href: ROUTES.QUIZZES },
] as const;

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1.5rem",
        borderBottom: "1px solid var(--colorNeutralStroke1)",
        backgroundColor: "var(--colorNeutralBackground1)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link
          to={ROUTES.HOME}
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            textDecoration: "none",
            color: "var(--colorNeutralForeground1)",
          }}
        >
          Tento
        </Link>

        {isAuthenticated && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {NAV_LINKS.map((link) => (
              <Button
                as="a"
                href={link.href}
                appearance={location.pathname === link.href ? "primary" : "subtle"}
                style={{ textDecoration: "none" }}
              >
                {link.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {isAuthenticated && user ? (
          <Menu>
            <MenuTrigger>
              <Button
                appearance="subtle"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <Avatar
                  name={user.username}
                  size={28}
                  style={{ backgroundColor: "var(--colorBrandBackground)" }}
                />
                <span style={{ fontSize: "0.875rem" }}>{user.username}</span>
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem
                  onClick={() => {
                    logout();
                  }}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        ) : (
          <Button as="a" href={ROUTES.LOGIN} appearance="primary">
            Login
          </Button>
        )}
      </div>
    </nav>
  );
}
