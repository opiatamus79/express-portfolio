CREATE TABLE vendors(
  id           serial,
  name         text,
  email        text,
  phone        text

);

CREATE TABLE item(
  id              serial,
  cat_name        text,
  cat_id          int,
  woo_com_id      int,
  woo_com_href    text,
  sku             int,
  vendor_id       int,
  price		  double precision,
  sale_price 	  double precision,
  on_sale	  bool
);














