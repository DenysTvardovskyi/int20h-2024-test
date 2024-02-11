import { FC, useEffect, useState } from "react";
import { System as SystemLayout } from "../../layouts";
import { Avatar, Button, Card, Col, Descriptions, Divider, Flex, InputNumber, Row, Space, Statistic } from "antd";
import { useApi } from "../../hooks";
import { IAuction, IBid, ILot, IMessage } from "../../models/auction";
import { useParams } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";

const { Meta } = Card;
const { Countdown } = Statistic;

interface IProps {}

export const Auction: FC<IProps> = (): JSX.Element => {
  const api = useApi();
  const [ info, setInfo ] = useState<IAuction>();
  const { id } = useParams();

  const [ currentLot, setCurrentLot ] = useState<ILot>();
  const [ showCountdown, setShowCountdown ] = useState(true);
  useEffect(() => {
    api.auctions.one({ id }).then((data) => {
      setInfo(data);
      if (data.state === "Closed") {
        setShowCountdown(false);
      }
      setCurrentLot(data?.lots.find((lot) => lot.state !== "BidsAreClosed") || data?.lots[0]);
    });
  }, [ id ]);

  const descriptionItems = [
    {
      key: 1,
      label: "Online auction",
      children: info?.id,
      span: 3,
    },
    {
      key: 2,
      label: "State",
      children: info?.state,
    },
    {
      key: 3,
      label: "Lots",
      children: info?.lots.length,
      span: 2,
    },
    {
      key: 4,
      label: "Description",
      children: info?.description,

    },
  ];

  const onLotFinish = () => {
    const curIndex = info?.lots.findIndex((i) => i.id === currentLot?.id);
    if (info?.lots.length && curIndex && curIndex !== (info?.lots.length - 1) && !!info?.lots[curIndex + 1]) {
      setCurrentLot(info?.lots[curIndex + 1]);
    } else {
      setShowCountdown(false);
    }
  };

  return (
    <SystemLayout>
      {!!currentLot && <Row>
        <Col md={6} style={{ width: "100%" }}>
          <Chat auctionId={info?.id} disabled={info?.state !== "Opened"} />
        </Col>
        <Col md={{ offset: 1, span: 10 }}>
          <Descriptions title={info?.title} items={descriptionItems} />
          {showCountdown &&
            <Countdown title="Countdown" value={new Date(currentLot.closesAt).toUTCString()} onFinish={onLotFinish} />
          }
          <Space direction="vertical" size="middle" style={{ display: "flex" }}>
            <Col>
              <Card title={currentLot.title} bordered={false}>
                {currentLot.description}
                <Divider />
                Bids: {currentLot.bids.length}
                <Divider />
                Statue: {currentLot.state}
                <Divider />
                Start: {new Date(currentLot.opensAt).toLocaleString()}
                <br />
                End: {new Date(currentLot.closesAt).toLocaleString()}
              </Card>
            </Col>
          </Space>

          <Row style={{ marginTop: 16 }}>
            <Col span={11}>
              <Row>Previous</Row>
              <Row>
                {info?.lots.filter((l: ILot) => l.state === "BidsAreClosed").map((l) => {
                  console.log(l);
                  return (
                    <Col span={24}>
                      <Card title={l.title} bordered={false}>
                        {l.description}
                        <Divider />
                        Ended at: {new Date(l.closesAt).toLocaleString()}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Col>
            <Col offset={1} span={11}>
              <Row>Next</Row>
              <Row>
                {info?.lots.filter((l: ILot) => l.state === "Scheduled").map((l) => {

                  return (
                    <Col span={24}>
                      <Card title={l.title} bordered={false}>
                        {l.description}
                        <Divider />
                        Start Price: {l.startPrice}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Col>
          </Row>
        </Col>
        <Col md={{ offset: 1, span: 6 }}>
          <Bids
            lotId={currentLot?.id}
            minPrice={currentLot.startPrice}
            minStep={currentLot.minPriceStepSize}
            disabled={info?.state !== "Opened"}
          />
        </Col>
      </Row>}
    </SystemLayout>
  );
};

const Chat = ({ auctionId, disabled }: any) => {
  const [ messages, setMessages ] = useState<IMessage[]>([]);
  const [ input, setInput ] = useState<string>("");
  // const [ centrifuge, setCentrifuge ] = useState<any>(null);
  const api = useApi();

  useEffect(() => {
    api.message.get({}).then((mes) => {
      setMessages([ ...mes ]);
    });
    //
    // const centrifuge = new Centrifuge("wss://jwp-team.com/centrifugo/connection/websocket");
    //
    // centrifuge.connect();
    // setCentrifuge(centrifuge);

    // return () => {
    //   if (centrifuge) {
    //     centrifuge.disconnect();
    //   }
    // };
  }, []);

  const sendMessage = () => {
    if (input.trim() !== "") {
      api.message.send({ auctionId, text: input });
      setInput("");
    }
  };
  return (
    <div style={{ height: "100%" }}>
      <h1>Chat</h1>
      <div style={{ height: "100%", maxHeight: "65vh", overflowY: "auto" }}>
        {messages.map((message: IMessage, index) => (
          <Card key={index} style={{ width: "100%", marginTop: index === 0 ? 0 : 16 }}>
            <Meta
              avatar={
                <Avatar src={!message.user.avatar ? "https://api.dicebear.com/7.x/miniavs/svg?seed=1" : message.user.avatar} />
              }
              title={message.user.fullName}
              description={<>
                <Flex vertical gap={8}>
                  <span>{message.text}</span>
                  <span>{new Date(message.createdAt).toLocaleString()}</span>
                </Flex>
              </>}
            />
          </Card>
        ))}
      </div>
      <TextArea
        style={{ marginTop: 8 }}
        disabled={disabled}
        rows={4}
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <Button disabled={disabled} type="primary" style={{ marginTop: 8 }} onClick={sendMessage}>Send</Button>
    </div>
  );
};

const Bids = ({ lotId, disabled, minPrice, minStep }: any) => {
  const [ bids, setBids ] = useState<IBid[]>([]);
  // const [ centrifuge, setCentrifuge ] = useState<any>(null);
  const [ currentPrice, setCurrentPrice ] = useState<number>(minPrice);
  const [ nextBid, setNextBid ] = useState<number>(minPrice + minStep);
  const [ customBid, setCustomBid ] = useState<number>(minPrice + minStep);
  const api = useApi();

  useEffect(() => {
    getBids();

    // const centrifuge = new Centrifuge("wss://jwp-team.com/centrifugo/connection/websocket");

    // centrifuge.connect();
    // setCentrifuge(centrifuge);

    // return () => {
    //   if (centrifuge) {
    //     centrifuge.disconnect();
    //   }
    // };
  }, []);

  const getBids = () => {
    api.bids.get({ lotId }).then(({ items }) => {
      setBids([ ...items ]);
      if (items.length > 0) {
        setCurrentPrice(items[0].price);
        setNextBid(items[0].price + minStep);
      }
    });
  };

  const sendBid = () => {
    api.bids.send({ lotId, price: nextBid });
    setCurrentPrice(nextBid);
    getBids();
  };
  const sendCustomBid = () => {
    if (customBid >= nextBid) {
      api.bids.send({ lotId, price: customBid });
      setCurrentPrice(customBid);
      getBids();
    }
  };

  return (
    <div style={{ height: "100%" }}>
      <h1>Bids</h1>
      <div style={{ height: "100%", maxHeight: "65vh", overflowY: "auto" }}>
        {bids.map((bid, index) => (
          <Card key={index} style={{ width: "100%", marginTop: index === 0 ? 0 : 16 }}>
            <Meta
              avatar={
                <Avatar src={!bid.user.avatar ? "https://api.dicebear.com/7.x/miniavs/svg?seed=1" : bid.user.avatar} />
              }
              title={bid.user.fullName + " - " + bid.price + "$"}
              description={new Date(bid.createdAt).toLocaleString()}
            />
          </Card>
        ))}
      </div>
      <div>
        <span>Current price: $ {currentPrice}</span>
      </div>
      <Button
        disabled={disabled}
        type="primary"
        style={{ marginTop: 8, width: "100%" }}
        onClick={sendBid}
      >Bid ${nextBid}</Button>
      <Divider plain>or</Divider>
      <Space.Compact style={{ width: "100%" }}>
        <InputNumber
          prefix="$"
          disabled={disabled}
          style={{ width: "100%" }}
          min={nextBid as any}
          value={customBid as any}
          defaultValue={customBid as any}
          onChange={setCustomBid}
        />
        <Button disabled={disabled} onClick={sendCustomBid} type="primary">Bid</Button>
      </Space.Compact>
    </div>
  );
};