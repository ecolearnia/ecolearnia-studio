/**
 * Created by ysahn on 5/13/15.
 */
var ViewComponent = require('./viewcomponent').ViewComponent;

var internals = {};

internals.const = {
    // prefix for EcoLearnia Interactive Object
    ID_PREFIX: 'elio_'
};

internals.TemplateContainerComponent = ViewComponent.extend({

    /**
     * Map of key -> ELI object,
     * where keys are unique key generated by parseTemplate and ELI object is
     * the FQN of the object which could be a object in model or a component.
     *
     * Example:
     * {
     *   'elio_1': '.model.question.prompt',
     *   'elio_2': '.component.mvquestion'
     * }
     * @type {Object.<string, object>}
     */
    elios_: {},

    /*
    template: function(context) {
        return
    },*/

    initialize: function(options) {
        this.coreContext = options.coreContext;
        this.contentModels = options.contentModels;
        this.config = options.config;
        this.template = this.parseTemplate(options.config.template);
    },

    render: function() {
        this.renderWithTemplate(this);

        // For each of the placeholders (divs with data-hook)
        // Inject the object from the coreContext
        for (var key in this.elios_) {
            var objectFqn = this.elios_[key];
            var objectEl = this.queryByHook(key);
            var object = this.coreContext.getObjectFromFqn(objectFqn);

            if (object.type && object.type.prototype) {
                // is a component, render it in the el
                // @todo - Consider checking for object.type.prototype.componentType
                this.coreContext.renderComponent(object, objectEl);
            } else {
                // @todo - Is is OK to just set the textContext with stringified object?
                objectEl.textContent = object.toString();
            }
        }
        return this;
    },

    // Parses a template of format
    // "{{.comonents.mvquestion}} <br /> {{.models.question.prompt}}"
    parseTemplate: function (templateStr)
    {
        var re = new RegExp('{{\\s*[\\w.]*\\s*}}', 'g');

        var template = []; // Template broken into patterns

        var cursor = 0;
        var idx = 0;

        var match;
        while ((match = re.exec(templateStr)) != null) {
            idx++;
            if (cursor != match.index) {
                // Append the substring that is not part of the match
                template.push(templateStr.substring(cursor, match.index));
            }
            // Replace the matching pattern with a markup
            var elioId = internals.const.ID_PREFIX + idx.toString();
            template.push('<div data-hook="' + elioId + '"></div>');
            // move forward the cursor to the tail of the matched pattern
            cursor = match.index + match[0].length;
            // index the pattern without the '{{' and '}}', and trim it
            this.elios_[elioId] = match[0].substring(2, match[0].length - 2).trim();
            //console.log("match " + match[0] + " found at " +   match.index);
        }
        // Append the rest of the text
        template.push(templateStr.substring(cursor));

        return template.join('');
    }
});


module.exports.TemplateContainerComponent = internals.TemplateContainerComponent;