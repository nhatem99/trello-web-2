import { useState, useEffect, useCallback, useRef } from "react";
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
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { cloneDeep } from "lodash";
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
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);
  const lastOverId = useRef(null);

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  }, [board]);

  // Tìm một cái Column theo CardId
  const findColumnByCardId = (carId) => {
    // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì trong handleDragOver chung ta
    //  sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumns.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(carId)
    );
  };

  //Function chung xử lý việc Cập nhật lại state trong trường hợp di chuyển Card giữa các Column khác nhau.
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns((prevColumn) => {
      // Tìm vị trí (index) của cái overCard trong column đích (nơi mà activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      );

      // logic tính toán "cardIndex mới" (trên hoặc dưới overCard) lấy chuẩn ra từ code của thư viện
      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;

      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1;

      // Clone mảng OrderedColumnsState cũ ra một caí mới để xử lý data rồi return - cập nhật
      // lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumn);
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );

      // column cũ
      if (nextActiveColumn) {
        // Xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }
      if (nextOverColumn) {
        // kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa , nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
        // Phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column khác nhau
        const rebuilt_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id,
        };

        // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuilt_activeDraggingCardData
        );
        // Cập nhật lại mảng orderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
      }
      return nextColumns;
    });
  };

  // Trigger khi bắt đầu kéo một phần tử
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id);
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(event?.active?.data?.current);
    // Nếu là kéo card thì mới thực hiện hành động set gía trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id));
    }
  };
  // Trigger trong qua trình kéo (drag) một phần tử
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;
    // Còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các column
    const { active, over } = event;
    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì cả(tránh crash trang)
    if (!active || !over) return;
    // activeDraggingCard  là cái card đang được kéo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;

    // overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } = over;

    // Tìm 2 cái column theo cardID
    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);
    // Nếu không tồn tại 1 trong 2 column thì không lam gì hết , tranh cash trang web
    if (!activeColumn || !overColumn) return;

    // Xử lý logic ơ đây khi kéo card qua 2 column khác nhau, còn nêú kéo card trong chính column ban đầu của nó thì khog làm gì
    // Vì đây là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      );
    }
  };

  // Trigger khi kết thúc hành động kéo một phần tử => hành đông thả drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì cả(tránh crash trang)
    if (!active || !over) return;
    // console.log("handleDragEnd:", event);
    // Xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard  là cái card đang được kéo
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData },
      } = active;

      // overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
      const { id: overCardId } = over;

      // Tìm 2 cái column theo cardID
      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);
      // Nếu không tồn tại 1 trong 2 column thì không lam gì hết , tranh cash trang web
      if (!activeColumn || !overColumn) return;

      // Hành động kéo thả card giũa 2 column khác nhau
      // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id (set vào state từ bước handlsDragStart) chứ không phải activeData trong scope handleDragEnd vì sau này khi đi qua onDragOver
      // tới đây là state của CARD đã bị cập nhật một lần rồi

      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        console.log("hành động kéo thả card giữa 2 column khác nhau");
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        );
      } else {
        // hành động kéo thả card trong cùng 1 column
        // Lấy vị trí cũ từ thằng oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        );
        // Lấy vị trí mới từ thàng overColumn
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        );
        // dùng arrayMove vì kéo card trong một cái column thì tương tự với logic kéo column trong một boardContent
        const dndOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );

        setOrderedColumns((prevColumn) => {
          // Clone mảng OrderedColumnsState cũ ra một caí mới để xử lý data rồi return - cập nhật
          // lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumn);
          // Tìm tới cái column mà chúng ta đang thả
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          );
          // cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id);

          // Trả về giá trị mới chuẩn vị trí
          return nextColumns;
        });
      }
    }
    // Xử lý kéo thả column trong một cái boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      console.log("hanh dông kéo thả column");
      // Nếu vị trí kéo thẩ khác với vị trí ban đầu
      if (active.id !== over.id) {
        // Lấy vị trí cũ từ thằng active
        const oldColumnIndex = orderedColumns.findIndex(
          (c) => c._id === active.id
        );
        // Lấy vị trí mới từ thằng over
        const newColumnIndex = orderedColumns.findIndex(
          (c) => c._id === over.id
        );
        // Dùng arrayMove của thằng dnd-kit để sắp xêp lại Column ban đầu
        const dndOrderedColumns = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        );
        // 2 cái console.log dữ liệu này sau dùng để xử lý gọi api
        // const dndOrderColumnsIds = dndOrderedColumns.map(c => c._id)

        // Cập nhật lại stateColumn sau khi kéo thả
        setOrderedColumns(dndOrderedColumns);
      }
    }
    //  Những dữ liệu sau khi kéo thả luôn phải đưa về giá trị null mặc định
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnWhenDraggingCard(null);
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

  // Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns
  // args = arguments = Các đối số , tham số
  const collisionDetectionStrategy = useCallback(
    (args) => {
      // Trường hợp kéo column thì dùng thuật toán closestCorners là chuân nhất
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }

      // Tìm các điểm giao nhau, va chạm - intersections với con trỏ
      const pointerIntersections = pointerWithin(args);

      // Thuật toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đây
      const intersections = !!pointerIntersections?.length
        ? pointerIntersections
        : rectIntersection(args);
      // Tìm overId đầu tiên trong đám intersections ở trên
      let overId = getFirstCollision(intersections, "id");
      if (overId) {
        // nếu cái over nó là column thì sẽ tìm tới cái cardId gần nhất bên trong khu vực va chạm đó dựa vào thuật toán phát hiện va chạm 
        // closetCenter hoặc closetCorners đều được. Tuy nhiên ở đây dùng closetCenter sẽ mượt hơn
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        );
        if (checkColumn) {
          overId = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => {
                return (
                  container.id !== overId &&
                  checkColumn?.cardOrderIds?.includes(container.id)
                );
              }
            ),
          })[0]?.id;
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }
      // Nếu overId là null thì trả về mảng rỗng - tránh bug crash trang
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumns]
  );
  return (
    <DndContext
      sensers={sensers}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      // Thuật toán phát hiện va chạm(nếu không có nó thì card với cover lớn sẽ không kéo qua column khác được vì luc này nó đang bị conflict giữa card và column),
      // chung ta sẽ dùng closetCorners thay vì closetCenter
      collisionDetection={collisionDetectionStrategy}
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
