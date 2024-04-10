CREATE DATABASE IF NOT EXISTS marketplace;
USE marketplace;

DROP TABLE IF EXISTS
    transaction, 
    comment_likes,
    comment,
    post_likes,
    post_tags,
    post,
    project_invite,
    project,
    follow,
    user;

CREATE TABLE user (
    -- General Attributes
    username        VARCHAR(32) PRIMARY KEY,
    password_hash   VARCHAR(128) NOT NULL,
    created_on      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email           VARCHAR(255) UNIQUE NOT NULL,
    biography       VARCHAR(255),
    experience      INTEGER NOT NULL DEFAULT 0,

    -- User Flags
    is_verified     BIT NOT NULL DEFAULT 0,
    is_banned       BIT NOT NULL DEFAULT 0,
    is_admin        BIT NOT NULL DEFAULT 0,

    -- Social Media Handles
    twitter         VARCHAR(15),
    instagram       VARCHAR(30),
    tiktok          VARCHAR(24),
    youtube         VARCHAR(30)
);

CREATE TABLE follow (
    follower        VARCHAR(32) NOT NULL,
    follows         VARCHAR(32) NOT NULL,
    
    FOREIGN KEY (follower) REFERENCES user(username) ON DELETE CASCADE,
    FOREIGN KEY (follows)  REFERENCES user(username) ON DELETE CASCADE,
    PRIMARY KEY(follower, follows)
);


CREATE TABLE project (
    -- https://dev.mysql.com/blog-archive/mysql-8-0-uuid-support/
    project_id      BINARY(16) PRIMARY KEY,

    title           VARCHAR(50) NOT NULL,
    created_on      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(32) NOT NULL,

    image_data      BLOB,

    FOREIGN KEY (created_by) REFERENCES user(username) ON DELETE CASCADE
);

CREATE TABLE project_invite (
    username        VARCHAR(32) NOT NULL,
    project_id      BINARY(16) NOT NULL,

    last_modified   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted        BIT NOT NULL DEFAULT 0,
    
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE,
    PRIMARY KEY (username, project_id)
);


CREATE TABLE post (
    post_id         BINARY(16) PRIMARY KEY,

    licence         ENUM('Commercial', 'Education', 'Creative Commons'), 
    cost            INTEGER NOT NULL DEFAULT 0,

    published_on    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_hidden       BIT NOT NULL DEFAULT 0,
    hidden_by       VARCHAR(32),

    FOREIGN KEY (post_id) REFERENCES project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (hidden_by) REFERENCES user(username)
);

-- We may wish to switch the order of  the primary key for faster results when searching by tag.
CREATE TABLE post_tags (
    post_id         BINARY(16) NOT NULL,
    tag             VARCHAR(25),
    
    FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag)
);

CREATE TABLE post_likes (
    post_id         BINARY(16) NOT NULL,
    username        VARCHAR(32),
    
    FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE,
    PRIMARY KEY (post_id, username)
);


CREATE TABLE comment (
    comment_id      INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,

    post_id         BINARY(16) NOT NULL,
    author          VARCHAR(32) NOT NULL,
    content         VARCHAR(255) NOT NULL,

    timestamp       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_hidden       BIT NOT NULL DEFAULT 0,
    hidden_by       VARCHAR(32),

    FOREIGN KEY (author) REFERENCES user(username) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE,
    FOREIGN KEY (hidden_by) REFERENCES user(username)
);

CREATE TABLE comment_likes (
    comment_id      INTEGER NOT NULL,
    username        VARCHAR(32),
    
    FOREIGN KEY (comment_id) REFERENCES comment(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE,
    PRIMARY KEY (comment_id, username)
);


CREATE TABLE transaction (
    transaction_id  INTEGER PRIMARY KEY AUTO_INCREMENT,

    post_id         BINARY(16) NOT NULL,
    username        VARCHAR(32) NOT NULL,
    status          ENUM('complete', 'pending', 'refunded') NOT NULL DEFAULT 'pending',
    timestamp       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES post(post_id)
);
