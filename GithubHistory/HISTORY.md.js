/**
Build HISTORY.md from your GitHub Tags and Milestones.
Note: Tag and Milestone name/title MUST MATCH!

**/

var
  GitHubApi = require('github'),
  async = require('async'),
  fs = require('fs'),
  _ = require('underscore');

var github = new GitHubApi({
  // required
  version: '3.0.0',
  // optional
  timeout: 5000
});

var REPO = 'MSMQCommander';
var USER = 'sverrehundeide';

/*
--optional
github.authenticate({
  type: 'oauth',
  token: 'yourtoken'
});
*/

var MDContent = '';
var calls = [];
github.repos.getTags({user: USER, repo: REPO}, function (err, tags) {
  if (err)
    throw err;

  github.issues.getAllMilestones({user: USER, repo: REPO, state: 'closed'}, function (err, milestones) {
    if (err)
      throw err;
    tags.forEach(function (tag) {
      var milestone = _.find(milestones, function (m) {
        return m.title === tag.name;
      });
      if (milestone) {
        var call = function (callback) {
          github.issues.repoIssues({user: USER, repo: REPO, state: 'closed', milestone: milestone.number}, function (err, issues) {
            if (err)
              throw err;
            if (issues.length == 0)
              return callback(null);

            MDContent += '\r\n### ' + issues[0].milestone.title + '\r\n\r\n';
            issues = _.sortBy(issues, function (issue) {
              return issue.closed_at;
            });
            issues.reverse();
            issues.forEach(function (issue) {
              var labels = '';
              if (issue.html_url.indexOf('/pull/') === -1) {
                if (issue.labels.length > 0) {
                  issue.labels.forEach(function (lbl) {
                    labels += lbl.name + ', ';
                  });
                }
                if (labels) {
                  labels = labels.substring(0, labels.length - 2);
                  MDContent += '[#' + issue.number + '](' + issue.html_url + ') ' + issue.title + ' [' + labels + ']  \r\n';
                }
                else
                  MDContent += '[#' + issue.number + '](' + issue.html_url + ') ' + issue.title + '  \r\n';
              }
            });
            return callback(null);
          });
        };
        calls.push(call);
      }
    });
    async.series(calls, function (err) {
      console.log(MDContent);
      fs.writeFileSync('./HISTORY.md', MDContent);
    });
  });
});
