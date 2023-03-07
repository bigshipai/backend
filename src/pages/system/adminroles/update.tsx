import React, { useState, useEffect } from "react";
import { Row, Col, Form, Input, Select, Button, message } from "antd";
import styles from "./update.module.less";
import { adminRole } from "../../../api/index";
import { useParams, useNavigate } from "react-router-dom";
import { BackBartment } from "../../../compenents";

export const AdminrolesUpdatePage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<any>([]);

  useEffect(() => {
    getParams();
  }, []);
  
  useEffect(() => {
    getDetail();
  }, [params.roleId]);

  const getParams = () => {
    adminRole.createAdminRole().then((res: any) => {
      const arr = [];
      let permissions = res.data.permissions;
      for (let i = 0; i < permissions.length; i++) {
        arr.push({
          label: permissions[i].name,
          value: permissions[i].id,
        });
      }
      setPermissions(arr);
    });
  };

  const getDetail = () => {
    adminRole.adminRole(Number(params.roleId)).then((res: any) => {
      let role = res.data.role;
      form.setFieldsValue({
        name: role.name,
        permission_ids: res.data.permission_ids,
      });
    });
  };

  const onFinish = (values: any) => {
    let id = Number(params.roleId);
    adminRole
      .updateAdminRole(id, values.name, values.permission_ids)
      .then((res: any) => {
        message.success("保存成功！");
        navigate(-1);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const handleChange = (value: any) => {};

  return (
    <>
      <Row className="playedu-main-body">
        <Col>
          <div className="float-left mb-24">
            <BackBartment title="编辑管理员角色" />
          </div>
          <div className="float-left">
            <Form
              form={form}
              name="basic"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              style={{ width: 600 }}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="角色名"
                name="name"
                rules={[{ required: true, message: "请输入角色名!" }]}
              >
                <Input style={{ width: 300 }} placeholder="请输入角色名" />
              </Form.Item>
              <Form.Item label="权限" name="permission_ids">
                <Select
                  style={{ width: 300 }}
                  mode="multiple"
                  allowClear
                  placeholder="请选择权限"
                  onChange={handleChange}
                  options={permissions}
                />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
                <Button
                  className="ml-15"
                  htmlType="button"
                  onClick={() => navigate(-1)}
                >
                  取消
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </>
  );
};
