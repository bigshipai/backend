import { InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  message,
  Modal,
  Progress,
  Row,
  Table,
  Tag,
  Upload,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import { useRef, useState } from "react";
import { generateUUID, parseVideo } from "../../utils";
import { minioMergeVideo, minioUploadId } from "../../api/upload";
import { UploadChunk } from "../../js/minio-upload-chunk";

interface PropsInterface {
  categoryIds: number[];
  onUpdate: () => void;
}

export const UploadVideoButton = (props: PropsInterface) => {
  const [showModal, setShowModal] = useState(false);
  const localFileList = useRef<FileItem[]>([]);
  const [fileList, setFileList] = useState<FileItem[]>([]);

  const getMinioUploadId = async () => {
    let resp: any = await minioUploadId("mp4");
    return resp.data;
  };

  const uploadProps = {
    multiple: true,
    beforeUpload: async (file: File) => {
      if (file.type === "video/mp4") {
        // 视频封面解析 || 视频时长解析
        let videoInfo = await parseVideo(file);
        // 添加到本地待上传
        let data = await getMinioUploadId();
        let run = new UploadChunk(file, data["upload_id"], data["filename"]);
        let item: FileItem = {
          id: generateUUID(),
          file: file,
          upload: {
            handler: run,
            progress: 0,
            status: 0,
            remark: "",
          },
          video: {
            duration: videoInfo.duration,
            poster: videoInfo.poster,
          },
        };
        item.upload.handler.on("success", () => {
          minioMergeVideo(
            data["filename"],
            data["upload_id"],
            props.categoryIds.join(","),
            item.file.name,
            "mp4",
            item.file.size,
            item.video?.duration || 0,
            item.video?.poster || ""
          ).then(() => {
            item.upload.status = item.upload.handler.getUploadStatus();
            setFileList([...localFileList.current]);
          });
        });
        item.upload.handler.on("progress", (p: number) => {
          item.upload.status = item.upload.handler.getUploadStatus();
          item.upload.progress = p;
          console.log("状态，进度", item.upload.status, item.upload.progress);
          setFileList([...localFileList.current]);
        });
        item.upload.handler.on("error", (msg: string) => {
          item.upload.status = item.upload.handler.getUploadStatus();
          item.upload.remark = msg;
          setFileList([...localFileList.current]);
        });
        setTimeout(() => {
          item.upload.handler.start();
        }, 500);
        // 先插入到ref
        localFileList.current.push(item);
        // 再更新list
        setFileList([...localFileList.current]);
      } else {
        message.error(`${file.name} 并不是 mp4 视频文件`);
      }
      return Upload.LIST_IGNORE;
    },
  };

  const closeWin = () => {
    if (fileList.length > 0) {
      let i = 0;
      fileList.map((item: any) => {
        item.run.cancel();
        i++;
      });
      if (i === fileList.length) {
        setShowModal(false);
        setFileList([]);
        localFileList.current = [];
        props.onUpdate();
      }
    } else {
      setShowModal(false);
      setFileList([]);
      localFileList.current = [];
      props.onUpdate();
    }
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          setShowModal(true);
        }}
      >
        上传视频
      </Button>

      {showModal && (
        <Modal
          width={800}
          title="上传视频"
          open={true}
          onCancel={() => {
            closeWin();
          }}
          maskClosable={false}
          closable={false}
          onOk={() => {
            closeWin();
          }}
        >
          <Row gutter={[0, 10]}>
            <Col span={24}>
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">请将视频拖拽到此处上传</p>
                <p className="ant-upload-hint">
                  支持一次上传多个 / 支持 mp4 格式视频
                </p>
              </Dragger>
            </Col>
            <Col span={24}>
              <Table
                pagination={false}
                rowKey="id"
                columns={[
                  {
                    title: "视频",
                    dataIndex: "name",
                    key: "name",
                    render: (_, record) => <span>{record.file.name}</span>,
                  },
                  {
                    title: "大小",
                    dataIndex: "size",
                    key: "size",
                    render: (_, record) => (
                      <span>
                        {(record.file.size / 1024 / 1024).toFixed(2)}M
                      </span>
                    ),
                  },
                  {
                    title: "进度",
                    dataIndex: "progress",
                    key: "progress",
                    render: (_, record: FileItem) => (
                      <>
                        {record.upload.status === 0 ? (
                          "等待上传"
                        ) : (
                          <Progress
                            size="small"
                            steps={20}
                            percent={record.upload.progress}
                          />
                        )}
                      </>
                    ),
                  },
                  {
                    title: "操作",
                    key: "action",
                    render: (_, record) => (
                      <>
                        {record.upload.status === 5 ? (
                          <Tag color="red">{record.upload.remark}</Tag>
                        ) : null}

                        {record.upload.status === 7 ? (
                          <Tag color="success">上传成功</Tag>
                        ) : null}
                      </>
                    ),
                  },
                ]}
                dataSource={fileList}
              />
            </Col>
          </Row>
        </Modal>
      )}
    </>
  );
};
