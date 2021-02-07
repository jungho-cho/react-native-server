const express = require("express");
const cors = require("cors");
const app = express();
const port = 8080;
const models = require("./models/index");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/banners", (req, res) => {
  models.Banner.findAll({
    limit: 2,
  })
    .then((result) => {
      res.send({ banners: result });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("에러가 발생하였습니다");
    });
});
app.get("/products", (req, res) => {
  models.Product.findAll({
    order: [["createdAt", "DESC"]],
    attributes: ["id", "name", "price", "seller", "imageUrl", "createdAt"],
    raw: true,
  })
    .then((result) => {
      console.log("Proudcts : ", result);
      res.send({ products: result });
    })
    .catch((error) => {
      console.error("DB error 발생", error);
      res.send("정보를 불러오던 중 에러가 발생하였습니다");
    });
});

app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  console.log("id : ", id);
  models.Product.findOne({
    where: {
      id: id,
    },
  })
    .then((result) => {
      console.log("data : ", result.dataValues);
      res.send({
        product: result.dataValues,
      });
    })
    .catch((error) => {
      console.error("정보를 불러오는 중 에러가 발생하였습니다.", error);
    });
});

app.post("/products", (req, res) => {
  const body = req.body;
  const { name, description, price, seller, imageUrl } = body;
  if (!name || !description || !price || !seller || !imageUrl) {
    res.status(400).send("모든 필드를 입력해주세요.");
  } else {
    models.Product.create({
      name,
      description,
      price,
      seller,
      imageUrl,
    })
      .then((result) => {
        console.log("상품 생성 결과 : ", result);
        // res.send("상품이 등록 되었습니다.");
        res.send({
          result,
        });
      })
      .catch((error) => {
        console.error("DB create error : ", error);
        res.status(400).send("상품 업로드에 문제가 발생했습니다.");
      });
  }

  // console.log(body);
});

app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  res.send({
    imageUrl: file.path,
  });
});

app.listen(port, () => {
  console.log("Server is running");
  models.sequelize
    .sync()
    .then(() => {
      console.log("DB 연결 성공!");
    })
    .catch((error) => {
      console.log("DB 연결 Error : ");
      console.error(error);
      process.exit();
    });
});
