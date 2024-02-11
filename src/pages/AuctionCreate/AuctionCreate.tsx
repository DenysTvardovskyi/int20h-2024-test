import { FC } from "react";
import { System as SystemLayout } from "../../layouts";
import { useApi, useNotification } from "../../hooks";
import { Button, DatePicker, Form, Input, InputNumber, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router-dom";

interface IProps {}

const { RangePicker } = DatePicker;
export const AuctionCreate: FC<IProps> = (): JSX.Element => {
  const api = useApi();
  const nav = useNavigate();
  const notification = useNotification();

  const onFinish = (values: any) => {
    const auction = {
      ...values, lots: values.lots.map((lot: any) => {
        return {
          title: lot.title,
          description: lot.description,
          startPrice: lot.startPrice,
          minPriceStepSize: lot.minPriceStepSize,
          opensAt: lot.RangePicker[0].$d,
          closesAt: lot.RangePicker[1].$d,
        };
      }),
    };

    api.auctions.create({ auction }).then((data) => {
      nav("/auctions/" + data.id);
      notification.success("Auction created!");
    }).catch(() => nav("/"));
  };

  return (
    <SystemLayout>
      <Form
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[ { required: true, message: "Missing title" } ]}
        >
          <Input placeholder="Title" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[ { required: true, message: "Missing description" } ]}
        >
          <TextArea rows={4} placeholder="Auction Description" />
        </Form.Item>
        <Form.List
          name="lots"
          rules={[
            {
              validator: async (_, lots) => {
                if (!lots || lots.length < 1) {
                  return Promise.reject(new Error("At least 1 lot"));
                }
              },
            },
          ]}

        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[ name, "title" ]}
                    rules={[ { required: true, message: "Missing title" } ]}
                  >
                    <Input placeholder="Title" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[ name, "description" ]}
                    rules={[ { required: true, message: "Missing description" } ]}
                  >
                    <Input placeholder="Description" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[ name, "startPrice" ]}
                    rules={[ { required: true, message: "Missing Start Price" } ]}
                  >
                    <InputNumber prefix="$" min={0 as any} defaultValue={100 as any} placeholder="Start price" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[ name, "minPriceStepSize" ]}
                    rules={[ { required: true, message: "Missing min Price Step Size" } ]}
                  >
                    <InputNumber prefix="$" min={0 as any} defaultValue={10 as any} placeholder="Min Price Step Size" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[ name, "RangePicker" ]}
                    rules={[ { required: true, message: "Missing min Price Step Size" } ]}
                  >
                    <RangePicker />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Lot
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </SystemLayout>
  );
};