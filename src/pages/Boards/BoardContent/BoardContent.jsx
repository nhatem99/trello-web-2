import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "~/utils/sorts";
import {
  DndContext,
  // PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

function BoardContent({ board }) {
  // Nếu dùng Pointersenser mặc đinh thì phải kết hợp thuộc tính css touch-action: none ở những phần tử kéo thả- nhưng mà còn bug
  // const pointerSenser = useSensor(PointerSensor, {
  //   activationConstraint: {
  //     distance: 10,
  //   },
  // });

  // Yêu cầu di chuyển chuột 10px thì mơi kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  // Nhấn giữ 250ms và dung sai của cảm ứng (dễ hiểu là di chuyển chênh lệch 5px) thì mới kích hoạt evenr
  const touchSensor = useSensor(TouchSensor, {
    deplay: 250,
    tolerance: 500,
  });

  // Ưu tiên sử dụng kêt hợp 2 loại sensors là mouse và touch để có trải nghiệm trên mobile tốt nhất,
  // không bị bug
  // const sensers = useSensors(pointerSenser);
  const sensers = useSensors(mouseSensor, touchSensor);
  // const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, "_id");
  const [orderedColumns, setOrderedColumns] = useState([]);

  // cùng một thời điểm chỉ có một phần tử đang được kéo (column hoặc là card)
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  }, [board]);

  // Trigger khi bắt đầu kéo một phần tử
  const handleDragStart = (event) => {
    // console.log("handleDragStart:", event);
    setActiveDragItemId(event?.active?.id);
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(event?.active?.data?.current);
  };

  // Trigger khi kết thúc hành động kéo một phần tử => hành đông thả drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    // console.log("handleDragEnd:", event);
    // Kiểm tra nếu khong tồn tại over (kéo linh tinh ra ngoài thì return luôn tránh lỗi)
    if (!over) return;
    // Nếu vị trí kéo thẩ khác với vị trí ban đầu
    if (active.id !== over.id) {
      // Lấy vị trí cũ từ thằng active
      const oldIndex = orderedColumns.findIndex((c) => c._id === active.id);
      // Lấy vị trí cũ từ thằng active
      const newIndex = orderedColumns.findIndex((c) => c._id === over.id);
      // Dùng arrayMove của thằng dnd-kit để sắp xêp lại Column ban đầu
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex);
      // 2 cái console.log dữ liệu này sau dùng để xử lý gọi api
      // const dndOrderColumnsIds = dndOrderedColumns.map(c => c._id)

      // Cập nhật lại stateColumn sau khi kéo thả
      setOrderedColumns(dndOrderedColumns);

      setActiveDragItemId(null);
      setActiveDragItemType(null);
      setActiveDragItemData(null);
    }
  };

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <DndContext
      sensers={sensers}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          backgroundColor: "primary.main",
          width: "100%",
          height: (theme) => theme.trello.boardContentHeight,
          display: "flex",
          p: "10px 0",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
        }}
      >
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemId &&
            activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
              <Column column={activeDragItemData} />
            )}
          {activeDragItemId &&
            activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
              <Card card={activeDragItemData} />
            )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
}

export default BoardContent;
