import React, { useState, useEffect } from "react";
import { Modal, Form, TreeSelect, Input, message } from "antd";
import styles from "./create.module.less";
import { user, department } from "../../../api/index";
import { UploadImageButton } from "../../../compenents";
import { ValidataCredentials, getHost } from "../../../utils/index";

interface PropInterface {
  id: number;
  open: boolean;
  onCancel: () => void;
}

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

export const MemberUpdate: React.FC<PropInterface> = ({
  id,
  open,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [departments, setDepartments] = useState<any>([]);
  const [avatar, setAvatar] = useState<string>(getHost() + "avatar/avatar.png");

  useEffect(() => {
    if (id == 0) {
      return;
    }
    getDetail();
  }, [id, open]);

  useEffect(() => {
    if (open) {
      getParams();
      form.setFieldsValue({
        password: "",
      });
    }
  }, [form, open]);

  const getParams = () => {
    if (id === 0) {
      return;
    }
    department.departmentList().then((res: any) => {
      const departments = res.data.departments;
      if (JSON.stringify(departments) !== "{}") {
        const new_arr: Option[] = checkArr(departments, 0);
        setDepartments(new_arr);
      }
    });
  };

  const getDetail = () => {
    user.user(id).then((res: any) => {
      let user = res.data.user;
      setAvatar(user.avatar);
      form.setFieldsValue({
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        idCard: user.id_card,
        dep_ids: res.data.dep_ids,
      });
    });
  };

  const checkChild = (departments: any[], id: number) => {
    for (let key in departments) {
      for (let i = 0; i < departments[key].length; i++) {
        if (departments[key][i].id === id) {
          return departments[key][i];
        }
      }
    }
  };

  const checkArr = (departments: any[], id: number) => {
    const arr = [];
    for (let i = 0; i < departments[id].length; i++) {
      if (!departments[departments[id][i].id]) {
        arr.push({
          label: departments[id][i].name,
          value: departments[id][i].id,
        });
      } else {
        const new_arr: Option[] = checkArr(departments, departments[id][i].id);
        arr.push({
          label: departments[id][i].name,
          value: departments[id][i].id,
          children: new_arr,
        });
      }
    }
    return arr;
  };

  const onFinish = (values: any) => {
    if (values.idCard !== "" && !ValidataCredentials(values.idCard)) {
      message.error("请输入正确的身份证号！");
      return;
    }

    user
      .updateUser(
        id,
        values.email,
        values.name,
        values.avatar,
        values.password || "",
        values.idCard,
        values.dep_ids
      )
      .then((res: any) => {
        message.success("保存成功！");
        onCancel();
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const onChange = (value: any) => {};

  return (
    <>
      <Modal
        title="编辑学员"
        centered
        forceRender
        open={open}
        width={484}
        onOk={() => form.submit()}
        onCancel={() => onCancel()}
        maskClosable={false}
      >
        <div className="float-left mt-24">
          <Form
            form={form}
            name="update-basic"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="学员头像"
              labelCol={{ style: { marginTop: 15, marginLeft: 46 } }}
              name="avatar"
              rules={[{ required: true, message: "请上传学员头像!" }]}
            >
              <div className="d-flex">
                {avatar && (
                  <img className="form-avatar mr-16" src={avatar} alt="" />
                )}
                <div className="d-flex">
                  <UploadImageButton
                    onSelected={(url) => {
                      setAvatar(url);
                      form.setFieldsValue({ avatar: url });
                    }}
                  ></UploadImageButton>
                </div>
              </div>
            </Form.Item>
            <Form.Item
              label="学员姓名"
              name="name"
              rules={[{ required: true, message: "请输入学员姓名!" }]}
            >
              <Input style={{ width: 274 }} placeholder="请填写学员姓名" />
            </Form.Item>
            <Form.Item
              label="登录邮箱"
              name="email"
              rules={[{ required: true, message: "请输入登录邮箱!" }]}
            >
              <Input style={{ width: 274 }} placeholder="请输入学员登录邮箱" />
            </Form.Item>
            <Form.Item label="登录密码" name="password">
              <Input.Password
                style={{ width: 274 }}
                placeholder="请输入登录密码"
              />
            </Form.Item>
            <Form.Item
              label="所属部门"
              name="dep_ids"
              rules={[{ required: true, message: "请选择学员所属部门!" }]}
            >
              <TreeSelect
                showCheckedStrategy={TreeSelect.SHOW_ALL}
                style={{ width: 274 }}
                treeData={departments}
                multiple
                allowClear
                placeholder="请选择学员所属部门"
              />
            </Form.Item>
            <Form.Item label="身份证号" name="idCard">
              <Input style={{ width: 274 }} placeholder="请填写学员身份证号" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};
