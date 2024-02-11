import { FC, useEffect, useState } from "react";
import { System as SystemLayout } from "../../layouts";
import { Card, Checkbox, Col, Divider, Empty, Flex, Input, Pagination, Row, Space, Typography } from "antd";
import { useApi } from "../../hooks";
import { IAuction } from "../../models/auction";
import { Link } from "react-router-dom";

const { Search } = Input;

interface IProps {}

export const Home: FC<IProps> = (): JSX.Element => {
  const api = useApi();
  const [ total, setTotal ] = useState<number>(0);
  const [ auctions, setAuctions ] = useState<IAuction[]>([]);
  const [ status, setStatus ] = useState<null | "Scheduled" | "Opened" | "Closed">(null);
  const [ params, setParams ] = useState({
    page: 1,
    pageSize: 10,
  });
  const [ search, setSearch ] = useState<string | null>(null);

  useEffect(() => {
    api.auctions.get({ params: { ...params, title: search, state: status } }).then(({ items, totalCount }) => {
      setAuctions(items);
      setTotal(totalCount);
    });
  }, [ status, params ]);

  const onSearch = (val: any) => {
    setSearch(val);
    api.auctions.get({ params: { ...params, title: val, state: status } })
      .then(({ items, totalCount }) => {
        setAuctions(items);
        setTotal(totalCount);
      });
  };

  const onChangeStatus = (type: any) => {
    if (type === status) {
      setStatus(null);
    } else {
      setStatus(type);
    }
  };

  return (
    <SystemLayout>
      <Row>
        <Col md={6}>
          <Flex vertical gap={15}>
            <Row>
              <Search
                placeholder="Search..."
                value={search as any}
                onInput={(e: any) => {
                  setSearch(e.target.value);
                }}
                onSearch={onSearch} enterButton
              />
            </Row>
            <Row>
              <Flex vertical gap={1}>
                <Typography>Auction status</Typography>
                <Checkbox
                  checked={status === "Scheduled"}
                  onChange={() => onChangeStatus("Scheduled")}
                >Scheduled</Checkbox>
                <Checkbox checked={status === "Opened"} onChange={() => onChangeStatus("Opened")}>Opened</Checkbox>
                <Checkbox checked={status === "Closed"} onChange={() => onChangeStatus("Closed")}>Closed</Checkbox>
              </Flex>
            </Row>
          </Flex>
        </Col>
        <Col md={{ span: 17, offset: 1 }}>
          {!!auctions.length ? <Space direction="vertical" size="middle" style={{ display: "flex" }}>
            <Row>Total Auctions: {total}</Row>
            <Row gutter={[ 16, 24 ]}>
              {auctions.map((auction, index) => {
                return (<Col key={index} span={8}>
                  <Card title={auction.title} bordered={false} extra={<Link to={"auctions/" + auction.id}>View</Link>}>
                    {auction.description}
                    <Divider />
                    Lots: {auction.lots.length}
                    <Divider />
                    Start: {new Date(auction.opensAt).toLocaleString()}
                    <br />
                    End: {new Date(auction.closesAt).toLocaleString()}
                  </Card>
                </Col>);
              })}
            </Row>
            <Row>
              <Pagination
                total={total} pageSize={params.pageSize} current={params.page} onChange={(page, pageSize) => setParams(
                { page, pageSize })}
              />
            </Row>
          </Space> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </Col>
      </Row>
    </SystemLayout>
  );
};