## Linux User and Group

Linux系统是一个多用户多任务的分时操作系统，任何一个要使用系统资源的用户，都必须首先向系统管理员申请一个账号，然后以这个账号的身份进入系统。

用户的账号一方面可以帮助系统管理员对使用系统的用户进行跟踪，并控制他们对系统资源的访问；另一方面也可以帮助用户组织文件，并为用户提供安全性保护。

每个用户账号都拥有一个惟一的用户名和各自的口令。

用户在登录时键入正确的用户名和口令后，就能够进入系统和自己的主目录。

实现用户账号的管理，要完成的工作主要有如下几个方面：

- 用户账号的添加、删除与修改。
- 用户口令的管理。
- 用户组的管理。

相关文件

| 文件                 | 用途描述            | 每行的pattern                                                |
| -------------------- | ------------------- | ------------------------------------------------------------ |
| /etc/passwd          | 用户账户信息        | 用户名:口令:用户标识号:组标识号:注释性描述:主目录:登录Shell  |
| /etc/shadow          | 安全用户账户信息    | 登录名:加密口令:最后一次修改时间:最小时间间隔:最大时间间隔:警告时间:不活动时间:失效时间:标志 |
| /etc/group           | 组账户信息          | 组名:口令:组标识号:组内用户列表                              |
| /etc/default/useradd | 账户创建的默认值    |                                                              |
| /etc/login.defs      | Shadow 密码套件配置 |                                                              |



### 一  用户管理

#### 1. 添加新的用户账号使用useradd命令

```bash
useradd 选项 用户名
```

1. 选项:
   - -c	comment	指定一段注释描述
   - -d    HOME_DIR     指定用户主目录, 默认使用登录名作为该用户主目录
   - -g    group    用户初始登陆组的组名或号码。组名必须已经存在。组号码必须指代已经存在的组
   - -G    --groups GROUP1[,GROUP2,...[,GROUPN]]]
   -  -s    Shell文件 指定用户的登录Shell, 默认是/bin/bash
   - -u    uid    指定用户名的用户ID
2. 用户名
   -  指定新账号的登录名

```bash
# useradd sam
执行以上命令,创建一个用户sam, 会创建/home/sam为sam用户的主目录
/etc/passwd文件会在新增一行记录sam:x:1002:1002::/home/sam:/bin/bash表示sam账户信息
/etc/group文件会新增一行记录sam:x:1002:表示sam所在的group信息
```

/etc/passwd文件pattern **用户名:口令:用户标识号:组标识号:注释性描述:主目录:登录Shell**

1. 用户名

   通常长度不超过8个字符,并且由大小写字母和/或数字组成.登录名中不能有冒号(:),因为冒号在这里是分隔符

   为了兼容起见，登录名中最好不要包含点字符(.)，并且不使用连字符(-)和加号(+)打头

2. 密码

   因为所有用户都有/etc/passwd文件的可读权限,存在安全隐患,所以linux使用了shadow技术，把真正的加密后的用户口令字存放到/etc/shadow文件中 

3. uid用户编号

   一般情况下它与用户名是一一对应的。如果几个用户名对应的用户标识号是一样的，系统内部将把它们视为同一个用户，但是它们可以有不同的口令、不同的主目录以及不同的登录Shell等。 

   创建用户时不指定uid,系统会自动分配一个

4. gid用户组编号

    对应/etc/group一条记录行

5. comment注释

6. 主目录

     它是用户在登录到系统之后所处的目录 

     各用户对自己的主目录有读、写、执行（搜索）权限，其他用户对此目录的访问权限则根据具体情况设置

7. 登录shell

     用户登录后，要启动一个进程，负责将用户的操作传给内核，这个进程是用户登录到系统后运行的命令解释器或某个特定的程序，即Shell。
     
8. 伪用户psuedo users

      这些用户在/etc/passwd文件中也占有一条记录，但是不能登录，因为它们的登录Shell为空。它们的存在主要是方便系统管理，满足相应的系统进程对文件属主的要求。 

     比如MySQL后系统自动创建的mysql用户等

     

#### 2. 删除用户userdel
```bash
# userdel [options] username
```
常用选项-r 用户主目录中的文件将随用户主目录和用户邮箱一起删除

```bash
# userdel -r sam
此命令删除用户sam在系统文件中（主要是/etc/passwd, /etc/shadow, /etc/group等）的记录，同时删除用户的主目录以及邮箱。
```

#### 3. 修改用户usermod

 修改用户账号就是根据实际情况更改用户的有关属性，如用户号、主目录、用户组、登录Shell等。 
```bash
# usermod [options] username
```
常用的选项包括`-c, -d, -m, -g, -G, -s, -u以及-o等`，这些选项的意义与`useradd`命令中的选项一样，可以为用户指定新的资源值。 

### 二 口令管理

用户管理的一项重要内容是用户口令的管理。用户账号刚创建时没有口令，但是被系统锁定，无法使用，必须为其指定口令后才可以使用，即使是指定空口令。 

指定和修改用户口令的Shell命令是`passwd`。超级用户可以为自己和其他用户指定口令，普通用户只能用它修改自己的口令。 

```bash
# passwd [options] [username]
```

可选项

- -l    lock 锁定口令，即禁用账号 
- -u    unlock解锁口令
- -d    delete使账号无口令

 如果默认用户名，则修改当前用户的口令 

普通用户修改自己的口令时，passwd命令会先询问原口令，验证后再要求用户输入两遍新口令，如果两次输入的口令一致，则将这个口令指定给用户；而超级用户为用户指定口令时，就不需要知道原口令。 

### 三 用户组管理

 每个用户都有一个用户组，系统可以对一个用户组中的所有用户进行集中管理。不同Linux 系统对用户组的规定有所不同，如Linux下的用户属于与它同名的用户组，这个用户组在创建用户时同时创建。 

#### 1. 新增用户组groupadd
```bash
# groupadd [options] group
```
options

- -f ,    --force

  如果group已经存在,则直接退出返回seccuss status

  如果同时使用了-g,并且指定的gid已经存在,则系统会重新分配一直唯一的gid

- -g,    --gid<u>GID</u>

  指定的gid必须是唯一的,若已存在则操作不成功
  
  除非同时使用-o
  
- -o,    --non-unique

  此选项允许添加一个使用非唯一 GID 的组

#### 2. 删除用户组groupdel

```bash
# groupdel group
```

不能移除现有用户的主组。在移除此组之前，必须先移除此用户

#### 3. 修改用户组groupmod

```bash
# groupmod [options] group
```

options

- -g,    --gid<u>GID</u> 

  与groupadd用法类似

- -o,    --non-unique

   与groupadd用法类似

- -n,    --new-name<u>NEW_GROUP</u> 

  用户组的名称将被替换为<u>NEW_GROUP</u>

#### 4. 切换用户组newgrp

一个用户可以同时属于多个用户组,可以进行切换以获取其他用户组的权限

```bash
$ newgrp [-] [group]
```


