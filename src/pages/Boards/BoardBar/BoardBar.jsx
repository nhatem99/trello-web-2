import React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VpnLockIcon from "@mui/icons-material/VpnLock";
import AddToDriveIcon from "@mui/icons-material/AddToDrive";
import BoltIcon from "@mui/icons-material/Bolt";
import FilterListIcon from "@mui/icons-material/FilterList";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { capitalizeFirstLetter } from "~/utils/formatters";
const MENU_STYLE = {
  color: "white",
  bgcolor: "transparent",
  border: "none",
  paddingX: "5px",
  borderRadius: "4px",
  "& .MuiSvgIcon-root": {
    color: "white",
  },
  "&:hover": {
    bgcolor: "primary.50",
  },
};
function BoardBar({board}) {

  return (
    <Box
      sx={{
        width: "100%",
        height: (theme) => theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        paddingX: 2,
        overflowX: "auto",
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
        "&::-webkit-scrollbar-track": { m: 2 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          sx={MENU_STYLE}
          icon={<DashboardIcon />}
          label={board?.title}
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<FilterListIcon />}
          label="Filter"
          clickable
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          sx={{
            fontWeight: "bold",
            color: "white",
            borderColor: "white",
            "&:hover": { borderColor: "white" },
          }}
          variant="outlined"
          startIcon={<PersonAddAltIcon />}
        >
          Invite
        </Button>
        <AvatarGroup
          max={5}
          sx={{
            gap: "10px",
            "& .MuiAvatar-root": {
              width: 34,
              height: 34,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              "&:first-of-type": { bgcolor: "#a4b0be" },
            },
          }}
        >
          <Tooltip title="nhat99">
            <Avatar
              alt="Remy Sharp"
              src="https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-1/281196727_2056117847891367_5193468949685103202_n.jpg?stp=dst-jpg_s100x100&_nc_cat=103&ccb=1-7&_nc_sid=fe8171&_nc_ohc=Gy_lh5UBMvIAX8YPTOY&_nc_ht=scontent.fsgn2-9.fna&_nc_e2o=f&oh=00_AfDSJDs7Sayi1mOti64uhFPl1oAlA_Vb7HYF8KpNPtX0FQ&oe=652210C9"
            />
          </Tooltip>
          <Tooltip title="nhat99">
            <Avatar
              alt="Remy Sharp"
              src="https://scontent.fsgn2-3.fna.fbcdn.net/v/t39.30808-1/355276572_3545849229016286_3467682477995460836_n.jpg?stp=dst-jpg_p320x320&_nc_cat=107&ccb=1-7&_nc_sid=fe8171&_nc_ohc=AzQWjGXJtRIAX9XBzGy&_nc_ht=scontent.fsgn2-3.fna&_nc_e2o=f&oh=00_AfAmaRLGqsd4peJO9CNZ5R8SBL7Zoab3C8Ywd9FOX-mIjQ&oe=65225C83"
            />
          </Tooltip>
          <Tooltip title="nhat99">
            <Avatar
              alt="Remy Sharp"
              src="https://scontent.fsgn2-3.fna.fbcdn.net/v/t39.30808-1/355276572_3545849229016286_3467682477995460836_n.jpg?stp=dst-jpg_p320x320&_nc_cat=107&ccb=1-7&_nc_sid=fe8171&_nc_ohc=AzQWjGXJtRIAX9XBzGy&_nc_ht=scontent.fsgn2-3.fna&_nc_e2o=f&oh=00_AfAmaRLGqsd4peJO9CNZ5R8SBL7Zoab3C8Ywd9FOX-mIjQ&oe=65225C83"
            />
          </Tooltip>
          <Tooltip title="nhat99">
            <Avatar
              alt="Remy Sharp"
              src="https://scontent.fsgn2-3.fna.fbcdn.net/v/t39.30808-1/355276572_3545849229016286_3467682477995460836_n.jpg?stp=dst-jpg_p320x320&_nc_cat=107&ccb=1-7&_nc_sid=fe8171&_nc_ohc=AzQWjGXJtRIAX9XBzGy&_nc_ht=scontent.fsgn2-3.fna&_nc_e2o=f&oh=00_AfAmaRLGqsd4peJO9CNZ5R8SBL7Zoab3C8Ywd9FOX-mIjQ&oe=65225C83"
            />
          </Tooltip>
          <Tooltip title="nhat99">
            <Avatar
              alt="Remy Sharp"
              src="https://scontent.fsgn2-3.fna.fbcdn.net/v/t39.30808-1/355276572_3545849229016286_3467682477995460836_n.jpg?stp=dst-jpg_p320x320&_nc_cat=107&ccb=1-7&_nc_sid=fe8171&_nc_ohc=AzQWjGXJtRIAX9XBzGy&_nc_ht=scontent.fsgn2-3.fna&_nc_e2o=f&oh=00_AfAmaRLGqsd4peJO9CNZ5R8SBL7Zoab3C8Ywd9FOX-mIjQ&oe=65225C83"
            />
          </Tooltip>
          <Tooltip title="nhat99">
            <Avatar
              alt="Remy Sharp"
              src="https://scontent.fsgn2-3.fna.fbcdn.net/v/t39.30808-1/355276572_3545849229016286_3467682477995460836_n.jpg?stp=dst-jpg_p320x320&_nc_cat=107&ccb=1-7&_nc_sid=fe8171&_nc_ohc=AzQWjGXJtRIAX9XBzGy&_nc_ht=scontent.fsgn2-3.fna&_nc_e2o=f&oh=00_AfAmaRLGqsd4peJO9CNZ5R8SBL7Zoab3C8Ywd9FOX-mIjQ&oe=65225C83"
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  );
}

export default BoardBar;
