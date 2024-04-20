const TaskModel = require("../models/TaskModel");

exports.CreateTask = (req, res) => {
  let reqBody = req.body;
  reqBody.email = req.headers["email"];
  TaskModel.create(reqBody, (err, data) => {
    if (err) {
      res.status(401).json({ status: "Fail", data: err });
    } else {
      res.status(201).json({ status: "Success", data: data });
    }
  });
};

exports.UpdateTask = async (req, res) => {
  try {
    let id = req.params.id;
    let status = req.params.status;
    let Qury = { _id: id };
    let reqBody = { status: status };
    let data = await TaskModel.updateOne(Qury, reqBody);
    if (data) {
      res.status(201).json({ status: "success", data: data });
    } else {
      res.status(404).json({ status: "fail", data: "data not found" });
    }
  } catch (error) {
    res.status(404).json({ status: "fail", data: "Something went wrong" });
  }
};
exports.DeleteTask = async (req, res) => {
  try {
    let id = req.params.id;
    let Qury = { _id: id };
    let data = await TaskModel.deleteOne(Qury);
    if (data) {
      res.status(201).json({ status: "success", data: data });
    } else {
      res.status(404).json({ status: "fail", data: "data not found" });
    }
  } catch (error) {
    res.status(404).json({ status: "fail", data: "Something went wrong" });
  }
};

exports.ListTaskByStatus = (req, res) => {
  let status = req.params.status;
  let email = req.headers["email"];

  TaskModel.aggregate(
    [
      { $match: { status: status, email: email } },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          status: 1,
          createDate: {
            $dateToString: {
              date: "$createDate",
              format: "%d-%m-%Y",
            },
          },
        },
      },
    ],
    (err, data) => {
      if (err) {
        res.status(401).json({ status: "Fail", data: err });
      } else {
        res.status(201).json({ status: "Success", data: data });
      }
    }
  );
};

exports.TaskStausCount = (req, res) => {
  let email = req.headers["email"];

  TaskModel.aggregate(
    [
      { $match: { email: email } },
      { $group: { _id: "$status", sum: { $count: {} } } },
    ],
    (err, data) => {
      if (err) {
        res.status(401).json({ status: "Fail", data: err });
      } else {
        res.status(201).json({ status: "success", data: data });
      }
    }
  );
};
