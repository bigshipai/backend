import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Input,
  Select,
  Button,
  Space,
  Table,
  Popconfirm,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import styles from "./index.module.less";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { user } from "../../api/index";
import { TreeDepartment } from "../../compenents";

interface DataType {
  id: React.Key;
  nickname: string;
  email: string;
  created_at: string;
  credit1: number;
  is_lock: number;
}

export const MemberPage: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [list, setList] = useState<any>([]);
  const [total, setTotal] = useState<number>(0);
  const [nickname, setNickname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [id_card, setIdCard] = useState<string>("");

  const columns: ColumnsType<DataType> = [
    {
      title: "ID",
      key: "id",
      dataIndex: "id",
    },
    {
      title: "学员昵称",
      dataIndex: "nickname",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "邮箱",
      dataIndex: "email",
    },
    {
      title: "积分",
      dataIndex: "credit1",
    },
    {
      title: "注册时间",
      dataIndex: "created_at",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" danger className="c-red">
            详情
          </Button>
          <Popconfirm
            title="警告"
            description="即将删除此账号，确认操作？"
            onConfirm={() => delUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger className="c-red">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getData(1, size);
  }, []);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const getData = (page: number, size: number) => {
    setSize(size);
    setPage(page);
    setLoading(true);
    user
      .userList(page, size, {
        nickname: nickname,
        email: email,
        id_card: id_card,
      })
      .then((res: any) => {
        setList(res.data.data);
        setTotal(res.data.total);
        setTimeout(() => {
          setSelectedRowKeys([]);
          setLoading(false);
        }, 1000);
      });
  };

  const resetData = () => {
    setNickname("");
    setEmail("");
    setIdCard("");
    setTimeout(() => {
      getData(1, 10);
    }, 1000);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const paginationProps = {
    current: page, //当前页码
    pageSize: size,
    total: total, // 总条数
    onChange: (page: number, pageSize: number) =>
      handlePageChange(page, pageSize), //改变页码的函数
    showSizeChanger: true,
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setTimeout(() => {
      getData(page, pageSize);
    }, 500);
  };

  const delUser = (id: any) => {
    user.destroyUser(id).then((res: any) => {
      setTimeout(() => {
        message.success("操作成功");
        getData(1, size);
      }, 1000);
    });
  };

  const hasSelected = selectedRowKeys.length > 0;
  return (
    <>
      <Row>
        <Col span={4}>
          <TreeDepartment
            defaultExpandedKeys={["0-0-0", "0-0-1"]}
            defaultSelectedKeys={["0-0-0", "0-0-1"]}
            defaultCheckedKeys={["0-0-0", "0-0-1"]}
            onUpdate={() => {
              console.log(111);
            }}
          ></TreeDepartment>
        </Col>
        <Col span={20}>
          <div className="playedu-main-body mb-24">
            <div className="float-left d-flex">
              <div className="d-flex mr-24">
                <Typography.Text>昵称：</Typography.Text>
                <Input
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                  }}
                  style={{ width: 160 }}
                  placeholder="请输入昵称"
                />
              </div>
              <div className="d-flex mr-24">
                <Typography.Text>邮箱：</Typography.Text>
                <Input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  style={{ width: 160 }}
                  placeholder="请输入邮箱"
                />
              </div>
              <div className="d-flex mr-24">
                <Typography.Text>身份证号：</Typography.Text>
                <Input
                  value={id_card}
                  onChange={(e) => {
                    setIdCard(e.target.value);
                  }}
                  style={{ width: 160 }}
                  placeholder="请输入身份证号"
                />
              </div>
              <div className="d-flex mr-24">
                <Button className="mr-16" onClick={resetData}>
                  重 置
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    getData(1, size);
                  }}
                >
                  查 询
                </Button>
              </div>
            </div>
          </div>
          <div className="playedu-main-body">
            <div className="float-left j-b-flex mb-24">
              <div className="d-flex">
                <Button
                  icon={<PlusOutlined />}
                  className="mr-16"
                  type="primary"
                >
                  新建
                </Button>
              </div>
              <div className="d-flex">
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  style={{ color: "#333333" }}
                  onClick={() => {
                    getData(page, size);
                  }}
                ></Button>
              </div>
            </div>
            <div className="float-left">
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={list}
                loading={loading}
                pagination={paginationProps}
                rowKey={(record) => record.id}
              />
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};
