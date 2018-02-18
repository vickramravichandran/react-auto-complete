import React from 'react';

export function getFormattedCode(getCode) {
    return (
        <div className="code-container">
            <div>
                <h6>JavaScript</h6>
                <pre>
                    <code className="language-jsx">
                        {getCode()}
                    </code>
                </pre>
            </div>
        </div>
    );
}
