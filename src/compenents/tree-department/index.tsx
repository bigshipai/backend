import { Button, Input, message, Tree } from "antd";
import { useState, useEffect } from "react";
import { department } from "../../api/index";
import { useSelector } from "react-redux";

interface Option {
  key: string | number;
  title: string;
  children?: Option[];
}

interface PropInterface {
  type: string;
  text: string;
  refresh: boolean;
  showNum: boolean;
  selected: any;
  onUpdate: (keys: any, title: any) => void;
}

export const TreeDepartment = (props: PropInterface) => {
  const [treeData, setTreeData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectKey, setSelectKey] = useState<number[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const localDepartments = useSelector(
    (state: any) => state.systemConfig.value.departments
  );

  useEffect(() => {
    if (props.selected && props.selected.length > 0) {
      setSelectKey(props.selected);
    }
  }, [props.selected]);

  useEffect(() => {
    setLoading(true);
    if (props.showNum) {
      department.departmentList().then((res: any) => {
        const departments: DepartmentsBoxModel = res.data.departments;
        const departCount: DepIdsModel = res.data.dep_user_count;
        setUserTotal(res.data.user_total);
        if (JSON.stringify(departments) !== "{}") {
          const new_arr: any[] = checkNewArr(departments, 0, departCount);
          setTreeData(new_arr);
        } else {
          const new_arr: Option[] = [
            {
              key: "",
              title: "全部",
              children: [],
            },
          ];
          setTreeData(new_arr);
        }
        setLoading(false);
      });
    } else {
      if (JSON.stringify(localDepartments) !== "{}") {
        const new_arr: any[] = checkArr(localDepartments, 0);
        setTreeData(new_arr);
      } else {
        const new_arr: Option[] = [
          {
            key: "",
            title: "全部",
            children: [],
          },
        ];
        setTreeData(new_arr);
      }
      setLoading(false);
    }
  }, [props.refresh, localDepartments]);

  const checkNewArr = (
    departments: DepartmentsBoxModel,
    id: number,
    counts: any
  ) => {
    const arr = [];
    for (let i = 0; i < departments[id].length; i++) {
      if (!departments[departments[id][i].id]) {
        arr.push({
          title: getNewTitle(
            departments[id][i].name,
            departments[id][i].id,
            counts
          ),
          key: departments[id][i].id,
        });
      } else {
        const new_arr: any = checkNewArr(
          departments,
          departments[id][i].id,
          counts
        );
        arr.push({
          title: getNewTitle(
            departments[id][i].name,
            departments[id][i].id,
            counts
          ),
          key: departments[id][i].id,
          children: new_arr,
        });
      }
    }
    return arr;
  };

  const checkArr = (departments: DepartmentsBoxModel, id: number) => {
    const arr = [];
    for (let i = 0; i < departments[id].length; i++) {
      if (!departments[departments[id][i].id]) {
        arr.push({
          title: (
            <span className="tree-title-elli">{departments[id][i].name}</span>
          ),
          key: departments[id][i].id,
        });
      } else {
        const new_arr: any[] = checkArr(departments, departments[id][i].id);
        arr.push({
          title: (
            <span className="tree-title-elli">{departments[id][i].name}</span>
          ),
          key: departments[id][i].id,
          children: new_arr,
        });
      }
    }
    return arr;
  };

  const getNewTitle = (title: any, id: number, counts: any) => {
    if (counts) {
      let value = counts[id] || 0;
      return (
        <span className="tree-title-elli">{title + "(" + value + ")"}</span>
      );
    } else {
      return <span className="tree-title-elli">{title}</span>;
    }
  };

  const onSelect = (selectedKeys: any, info: any) => {
    let label = "全部" + props.text;
    if (info) {
      label = info.node.title.props.children;
    }
    props.onUpdate(selectedKeys, label);
    setSelectKey(selectedKeys);
  };

  const onExpand = (selectedKeys: any, info: any) => {
    let label = "全部" + props.text;
    if (info) {
      label = info.node.title.props.children;
    }
    props.onUpdate(selectedKeys, label);
    setSelectKey(selectedKeys);
  };

  return (
    <div>
      <div
        className={
          selectKey.length === 0
            ? "mb-8 category-label active"
            : "mb-8 category-label"
        }
        onClick={() => onSelect([], "")}
      >
        全部{props.text}
        {props.showNum && userTotal ? "(" + userTotal + ")" : ""}
      </div>
      {treeData.length > 0 && (
        <Tree
          selectedKeys={selectKey}
          onSelect={onSelect}
          onExpand={onExpand}
          treeData={treeData}
          // defaultExpandAll={true}
          switcherIcon={<i className="iconfont icon-icon-fold c-gray" />}
        />
      )}
    </div>
  );
};
