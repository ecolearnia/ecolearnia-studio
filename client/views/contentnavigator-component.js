/*
 * This file is part of the EcoLearnia platform.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * EcoLearnia v0.0.1
 *
 * @fileoverview
 *  This file includes the definition of ActionBarComponent className.
 *
 * @author Young Suk Ahn Park <ys.ahnpark@mathnia.com>
 * @date 7/12/15
 */

var React = require('react');
var lodash = require('lodash');

var ContentTableComponent = require ('./contenttable-component.jsx').ContentTableComponent;

var internals = {};

/**
 * @className ActionBarComponent
 *
 * @module interactives/components
 *
 * @classdesc
 *  Content navigation bar that contains:
 *  - Favorite
 *  - Node search
 *
 */
export class ContentNavigatorComponent extends React.Component
{
    constructor(props)
    {
        super(props);

        this.retrieveNodes_ = this.retrieveNodes_.bind(this);

        this.state = {
            totalHits: 0,
            page: 0,
            pageSize: this.props.pageSize,
            contentNodes: null
        };
    }

    componentWillMount()
    {

    }

    render()
    {
        var totalPages = Math.ceil(this.state.totalHits / this.props.pageSize);
        var pagesNums = lodash.range(0, totalPages);

        return (
            <div className={this.props.rootClass} >
                {/* Dropdown Trigger */}
                <a className='dropdown-button btn' href='#' data-activates='workspace-el' style={{width:"100%"}}>Workspaces!</a>
                {/* Dropdown Structure */}
                <ul id='workspace-el' className='dropdown-content'>
                    <li><a href="#!">Korean</a></li>
                    <li><a href="#!">US-West Coast</a></li>
                    <li className="divider"></li>
                    <li><a href="#!">Chinese</a></li>
                </ul>

                <ul className="collapsible" data-collapsible="accordion">
                    <li>
                        <div className="collapsible-header"><i className="mdi-action-bookmark"></i>Favorite</div>
                        <div className="collapsible-body">
                            <ul>
                                <li>My Favorite content</li>
                            </ul>
                        </div>
                    </li>

                    <li>
                        <div className="collapsible-header active"><i className="mdi-file-folder"></i>Root contents</div>
                        <div className="collapsible-body">

                            <div className="row">
                                <form className="col s12">
                                    <div className="input-field tight">
                                        <input id="code" type="text" ref="searchCode"
                                               onChange={this.handleChange_.bind(this, 'code')} />
                                        <label for="code">Code</label>
                                    </div>
                                    <div className="input-field tight">
                                        <input id="title" type="text" ref="searchTitle"
                                               onChange={this.handleChange_.bind(this, 'title')} />
                                        <label for="title">Title</label>
                                    </div>
                                </form>
                            </div>

                            <ContentTableComponent contentNodes={this.state.contentNodes} />

                            <ul className="pagination">
                                {pagesNums.map(this.renderPageLink, this)}
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        );
    }

    renderPageLink (n, i) {
        var cls = this.state.page === n ? 'active' : '';
        return (
            <li key={i} className={cls} >
                <a href='#' onClick={this.changePage_.bind(this, n)}>{n}</a>
            </li>
        );
    }

    buildCriteriaFromFields()
    {
        var criteriaEl = [];
        var searchCode = this.refs.searchCode.getDOMNode().value;
        var searchTitle = this.refs.searchTitle.getDOMNode().value;

        if (searchCode) {
            criteriaEl.push('metadata.learningArea.subject LIKE "' + searchCode + '%"');
        }
        if (searchTitle) {
            criteriaEl.push('metadata.title LIKE "' + searchTitle + '%"');
        }

        return criteriaEl.join( ' AND ');
    }

    handleChange_(field, e)
    {
        var criteria = this.buildCriteriaFromFields();

        this.retrieveNodes_(criteria);
    }

    changePage_(page, e)
    {
        e.preventDefault();
        var criteria = this.buildCriteriaFromFields();

        this.retrieveNodes_(criteria, page);
    }

    retrieveNodes_(criteria, page)
    {
        var self = this;

        this.props.app.getContentService().queryNodes(criteria, this.props.pageSize, page)
        .then ( function(result) {
            self.setState({
                totalHits: result.totalHits,
                page: page,
                pageSize: self.props.pageSize,
                contentNodes: result.documents
            });
        })
        .catch( function(error) {
            self.props.app.showMessage('Error', 'Error fetching nodes: ' + JSON.stringify(error));
        });
    }
};


ContentNavigatorComponent.propTypes = {
    /*
    // Component's settings
    config: React.PropTypes.object.isRequired
    */
};

ContentNavigatorComponent.defaultProps =
{
    rootClass: '',
    pageSize: 20
};
