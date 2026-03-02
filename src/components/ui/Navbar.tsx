import { Link, useLocation } from "react-router-dom";
import {
  Button,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";
import { LAYOUT } from "../../styles/layoutRhythm";

const NAV_LINKS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD },
  { label: "My Quizzes", href: ROUTES.QUIZZES },
] as const;

const useStyles = makeStyles({
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: tokens.spacingVerticalS,
    columnGap: tokens.spacingHorizontalM,
    ...shorthands.padding(tokens.spacingVerticalM, LAYOUT.navPadding),
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke1),
    backgroundColor: tokens.colorNeutralBackground1,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  leftGroup: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "clamp(0.75rem, 2vw, 1.75rem)",
  },
  brand: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    textDecorationLine: "none",
    color: tokens.colorNeutralForeground1,
  },
  linkGroup: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  profileButton: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  username: {
    fontSize: tokens.fontSizeBase200,
    maxWidth: "10rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const styles = useStyles();

  return (
    <header>
      <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.leftGroup}>
        <Link to={ROUTES.HOME} className={styles.brand}>
          Tento
        </Link>

        {isAuthenticated && (
          <div className={styles.linkGroup}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.href}
                as="a"
                href={link.href}
                aria-current={
                  location.pathname === link.href ? "page" : undefined
                }
                appearance={
                  location.pathname === link.href ? "primary" : "subtle"
                }
              >
                {link.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {isAuthenticated && user ? (
          <Menu>
            <MenuTrigger>
              <Button appearance="subtle" className={styles.profileButton}>
                <Avatar name={user.username} size={28} />
                <span className={styles.username}>{user.username}</span>
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
    </header>
  );
}
