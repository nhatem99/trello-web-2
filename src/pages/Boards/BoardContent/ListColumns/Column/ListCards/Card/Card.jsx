import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Card as MuiCard } from "@mui/material";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { mapOrder } from "~/utils/sorts";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
function Card({ card }) {
  const { attributes, listeners, setNodeRef, transform, transition , isDragging} =
    useSortable({
      id: card._id,
      data: { ...card },
    });

  const dndKitCardStyles = {
    // Nếu sử dụng css.Tranform như docs sẽ lỗi kiểu Strethch
    // https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqbEpsZTFoaHVrVFlVV1pjZ3NDX1ZfaVd6Tm5LQXxBQ3Jtc0tuRHRQblZqUFZRVEtsLXBSU3RST3NrNkxJTHFiLW5EQ3Y0QWhjZVphSGpXcXFYRUNHVGhMakxjSEoxYUdtSWtjTjUyTlBXaU5uZGhFa19yMzhrOEE2blN3dGlDLXREcmR6aDRQUktpdnJVWHNMT094aw&q=https%3A%2F%2Fgithub.com%2Fclauderic%2Fdnd-kit%2Fissues%2F117&v=IttteelPx-k
    // touchAction:'none' // dành cho sensor default dạng PointerSensor

    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined
  };
  const shouldShowCarActions = () => {
    return (
      !!card?.memberIds?.length ||
      !!card?.comments?.length ||
      !!card?.attachments?.length
    );
  };
  return (
    <MuiCard
      ref={setNodeRef}
      style={dndKitCardStyles}
      {...attributes}
      {...listeners}
      sx={{
        cursor: "pointer",
        boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
        overflow: "unset",
      }}
    >
      {card?.cover && <CardMedia sx={{ height: 140 }} image={card?.cover} />}

      <CardContent sx={{ p: 1.5, "&:last-child": { p: 1.5 } }}>
        <Typography>{card?.title}</Typography>
      </CardContent>
      {shouldShowCarActions() && (
        <CardActions sx={{ p: "0 4px 8px 4px" }}>
          {!!card?.memberIds?.length && (
            <Button size="small">
              <GroupIcon />
              {card?.memberIds?.length}
            </Button>
          )}
          {!!card?.comments?.length && (
            <Button size="small">
              <CommentIcon />
              {card?.comments?.length}
            </Button>
          )}
          {!!card?.attachments?.length && (
            <Button size="small">
              <AttachmentIcon />
              {card?.attachments?.length}
            </Button>
          )}
        </CardActions>
      )}
    </MuiCard>
  );
}

export default Card;
