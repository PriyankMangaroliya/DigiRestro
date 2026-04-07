module.exports = {
  viewKot: async (req, res) => {
    try {
      const branchId = await tokenController.getBranchID(req, res);

      const orders = await orderSchema
        .find({
          branch_id: new mongoose.Types.ObjectId(branchId),
          created_at: {
            $gte: new Date(new Date().setHours(0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59)),
          },
          item: {
            $elemMatch: {
              itemStatus: 2,
            },
          },
        })
        .populate({
          path: "table_id",
          select: "table_name",
        })
        .populate({
          path: "item.food_sub_item_id",
          model: "food_sub_item",
          select: "sub_item_name food_item_id",
          populate: {
            path: "food_item_id",
            model: "food_item",
            select: "item_name",
          },
        });

      // console.log(orders)
      const kotData = orders.map((order) => ({
        _id: order._id,
        branch_id: order.branch_id,
        bill_no: order.bill_no,
        table_id: {
          _id: order.table_id._id,
          table_name: order.table_id.table_name,
        },
        item: order.item
          .map((item) => ({
            food_sub_item_id: {
              _id: item.food_sub_item_id._id,
              sub_item_name: item.food_sub_item_id.sub_item_name,
              item_name: item.food_sub_item_id.food_item_id.item_name,
            },
            quantity: item.quantity,
            itemStatus: item.itemStatus,
            created_at: item.created_at,
            _id: item._id,
          }))
          .filter((item) => item.itemStatus === 2),
        created_at: order.created_at,
      }));

      // console.log(kotData[0].item);

      res.render(`${appPath}/branch/view-kot.ejs`, { kotData });
    } catch (error) {
      console.error("Error view KOT:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
